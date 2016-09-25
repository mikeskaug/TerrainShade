let THREE = require( 'three' );
let PNG = require('png.js');
import _ from 'underscore';
import Trackballcontrols from 'three-trackballcontrols';

import { fetchElevationTile,
        getImageTileURL,
        getElevationsFromRGBA,
        arrayMean,
        arrayRange,
        getTileDimensions,
        png2Array } from './utils';

class Terrain {
    constructor () {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 );
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.shadowMap.enabled = true;
        this.controls = new TrackballControls(this.camera);
        this.zoom = 13;
    }

    initScene () {
        this.scene.background = new THREE.Color( 'rgb(255, 255, 255)' );
        this.camera.position.set(20, -80, 200);

        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );
    }

    renderTile (lon, lat) {
        this.getElevationData(lon, lat)
            .then( elevations => {
                this.createTerrainGeometry(elevations, lon, lat);
                this.loadTexture(lon, lat)
                    .then( texture => {
                      this.material = new THREE.MeshLambertMaterial({
                          map: texture
                      });

                      this.terrain = new THREE.Mesh( this.geometry, this.material );
                      this.terrain.castShadow = true;
                      this.terrain.receiveShadow = true;
                      this.scene.add( this.terrain );
                      this.addAmbientLight();
                      this.addSunLight();
                      this.addDirectionalLightHelper(this.sunLight);
                      this.renderScene();
                    });
            });

    }

    getElevationData (lon, lat) {
        let fetchResponse = fetchElevationTile(lon, lat, this.zoom);

        return fetchResponse.then( response => { return response.arrayBuffer() })
            .then( arrayBuffer => {
                let pngReader = new PNG(arrayBuffer);
                return new Promise( (resolve, reject) => {
                    pngReader.parse( (err, png) => { resolve(png); } )
                });
            })
            .then( png => {
                let pixelDataArray = png2Array(png);
                let elevations = getElevationsFromRGBA(pixelDataArray);
                return elevations;
            });
    }

    addAxes () {
        let axes = new THREE.AxisHelper(100);
        this.scene.add(axes);
    }

    addDirectionalLightHelper (light) {
        let directionalLightHelper = new THREE.DirectionalLightHelper(light, 20);
        this.scene.add(directionalLightHelper);
    }

    createTerrainGeometry (elevations, lon, lat)  {
        let gridUnits = Math.sqrt(elevations.length);
        let meshSize = 60;
        this.geometry = new THREE.PlaneGeometry(meshSize, meshSize, gridUnits - 1, gridUnits - 1);
        let meanElevation = arrayMean(elevations);
        let tileDimensions = getTileDimensions(lon, lat, this.zoom);
        let meshUnitsPerMeter = meshSize / tileDimensions.y;

        _.range(this.geometry.vertices.length).map(i => {
            this.geometry.vertices[i].z = (elevations[i] - meanElevation) * meshUnitsPerMeter;
        });
    }

    loadTexture (lon, lat) {
        let url = getImageTileURL(lon, lat, this.zoom);
        let loader = new THREE.TextureLoader();

        return new Promise((resolve, reject) => {
          loader.load(url, (texture) => {
            resolve(texture);
          });
        });
    }

    addAmbientLight () {
      let light = new THREE.AmbientLight( 0x404040 ); // soft white light
      this.scene.add( light );
    }

    addSunLight () {
        this.sunLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
        this.sunLight.position.set( 15, 0, 3 );
        this.sunLight.castShadow = true;
        let dLight = 100;
  			let sLight = dLight * 0.25;
  			this.sunLight.shadow.camera.left = -sLight;
  			this.sunLight.shadow.camera.right = sLight;
  			this.sunLight.shadow.camera.top = sLight;
  			this.sunLight.shadow.camera.bottom = -sLight;
  			this.sunLight.shadow.camera.near = dLight / 30;
  			this.sunLight.shadow.camera.far = dLight;
  			this.sunLight.shadow.mapSize.x = 1024 * 2;
  			this.sunLight.shadow.mapSize.y = 1024 * 2;
        this.scene.add( this.sunLight );
    }

    renderScene () {
        let render = () => {
            this.controls.update();
            requestAnimationFrame( render );
            this.renderer.render(this.scene, this.camera);
        };

        render();
    }
}

export default Terrain;
