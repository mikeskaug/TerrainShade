let THREE = require( 'three' );
let PNG = require('png.js');
import _ from 'underscore';
import Trackballcontrols from 'three-trackballcontrols';

import { fetchElevationTile, getElevationsFromRGBA, arrayMean, arrayRange ,getTileDimensions, png2Array } from './utils';

class Terrain {
    constructor () {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 );
        this.renderer = new THREE.WebGLRenderer();
        this.controls = new TrackballControls(this.camera);
        this.zoom = 13;
    }
    
    initScene () {
        this.scene.background = new THREE.Color( 'rgb(255, 255, 255)' );
        this.camera.position.set(20, -80, 500);
        
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );
    }
    
    renderTile (lon, lat) {
        this.getElevationData(lon, lat)
            .then( elevations => {
                this.addTerrainToScene(elevations, lon, lat);
                this.renderScene();
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

    addTerrainToScene (elevations, lon, lat)  {
        let gridUnits = Math.sqrt(elevations.length);
        let meshSize = 60;
        this.geometry = new THREE.PlaneGeometry(meshSize, meshSize, gridUnits - 1, gridUnits - 1);
        let meanElevation = arrayMean(elevations);
        let tileDimensions = getTileDimensions(lon, lat, this.zoom);
        let meshUnitsPerMeter = meshSize / tileDimensions.y;
        
        _.range(this.geometry.vertices.length).map(i => {
            this.geometry.vertices[i].z = (elevations[i] - meanElevation) * meshUnitsPerMeter;
        });
        
        this.material = new THREE.MeshBasicMaterial({
            color: 0x000000, 
            wireframe: true
        });
        this.terrain = new THREE.Mesh( this.geometry, this.material );
        this.scene.add( this.terrain );
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