let THREE = require('three');
let PNG = require('png.js');
import _ from 'underscore';
import TrackballControls from 'three-trackballcontrols';

import { fetchElevationTile,
        getImageTileURL,
        getElevationsFromRGBA,
        getTileDimensions} from './tileUtilities';

import { arrayMean, png2Array, sphericalToCartesian } from './utils';

class Terrain {
  constructor (args) {
    this.containerID = args.divID;
    this.scene = new THREE.Scene();

    this.perspectiveCamera = new THREE.PerspectiveCamera(45, 3 / 2, 0.1, 1000);
    this.perspectiveCamera.position.set(50, -64, 25);
    this.perspectiveCamera.lookAt(new THREE.Vector3(0, 0, 0));
    this.perspectiveCamera.up = new THREE.Vector3(-0.4, 0.6, 0.31);
    this.controls = new TrackballControls(this.perspectiveCamera,
      document.getElementById(args.divID));

    this.orthoCamera = new THREE.OrthographicCamera(80 / -2, 80 / 2, 80 / 2, 80 / -2, 0, 1000);
    this.orthoCamera.position.set(0, 0, 100);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.zoom = args.zoom;
    this.sunPosition = args.sunPosition;
    this.terrainLoadComplete = args.terrainLoadComplete;
  }

  initScene () {
    this.scene.background = new THREE.Color('rgb(50%, 50%, 50%)');
    this.scene.fog = new THREE.FogExp2(0xffffff, 0.003);
    let container = document.getElementById(this.containerID);
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.rendererInitSize = this.renderer.getSize();
    container.appendChild(this.renderer.domElement);
    this.addAmbientLight();
    this.addSunLight();
  }

  setView (view) {
    if (view === 'ortho') {
      this.camera = this.orthoCamera;
      this.controls.enabled = false;
      this.renderer.setSize(this.rendererInitSize.width, this.rendererInitSize.width);
    } else if (view === 'perspective') {
      this.camera = this.perspectiveCamera;
      this.renderer.setSize(this.rendererInitSize.width, this.rendererInitSize.height);
      this.controls.enabled = true;
    }
  }

  addHelpers () {
    this.addDirectionalLightHelper(this.sunLight);
    this.addAxes();
  }

  renderTile (lon, lat) {
    this.getElevationData(lon, lat)
        .then(elevations => {
          this.createTerrainGeometry(elevations, lon, lat);
          this.loadTexture(lon, lat)
              .then(texture => {
                this.material = new THREE.MeshPhongMaterial({map: texture,
                  side: THREE.DoubleSide,
                  needsUpdate: true});
                this.terrain = new THREE.Mesh(this.geometry, this.material);
                this.terrain.castShadow = true;
                this.terrain.receiveShadow = true;
                this.scene.add(this.terrain);
                this.renderScene();
                this.terrainLoadComplete();
              });
        });
  }

  clearTile () {
    this.scene.remove(this.terrain);
  }

  getElevationData (lon, lat) {
    let fetchResponse = fetchElevationTile(lon, lat, this.zoom);

    return fetchResponse.then(response => response.arrayBuffer())
        .then(arrayBuffer => {
          let pngReader = new PNG(arrayBuffer);
          return new Promise((resolve) => {
            pngReader.parse((err, png) => resolve(png));
          });
        })
        .then(png => {
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
    let shadowCameraHelper = new THREE.CameraHelper(light.shadow.camera);
    this.scene.add(shadowCameraHelper);
  }

  createTerrainGeometry (elevations, lon, lat) {
    let gridUnits = Math.sqrt(elevations.length);
    let meshSize = 60;
    this.geometry = new THREE.PlaneGeometry(meshSize, meshSize, gridUnits - 1, gridUnits - 1);
    let meanElevation = arrayMean(elevations);
    let tileDimensions = getTileDimensions(lon, lat, this.zoom);
    let meshUnitsPerMeter = meshSize / tileDimensions.y;

    _.range(this.geometry.vertices.length).map(i => {
      this.geometry.vertices[i].z = (elevations[i] - meanElevation) * meshUnitsPerMeter;
    });
    this.geometry.normalsNeedUpdate = true;
    this.geometry.computeFaceNormals();
    this.geometry.computeVertexNormals();
  }

  loadTexture (lon, lat) {
    let url = getImageTileURL(lon, lat, this.zoom);
    let loader = new THREE.TextureLoader();

    return new Promise((resolve) => {
      loader.load(url, (texture) => {
        resolve(texture);
      });
    });
  }

  addAmbientLight () {
    let light = new THREE.AmbientLight(0x404040, 2.0);
    this.scene.add(light);
  }

  addSunLight () {
    let sunXYZ = sphericalToCartesian(this.sunPosition);
    this.sunLight = new THREE.DirectionalLight(0xffffff, 0.7);
    this.sunLight.position.set(sunXYZ[0], sunXYZ[1], sunXYZ[2]);
    this.sunLight.castShadow = true;
    let dLight = 70;
    let sLight = dLight * 0.5;
    this.sunLight.shadow.camera.left = -sLight;
    this.sunLight.shadow.camera.right = sLight;
    this.sunLight.shadow.camera.top = sLight;
    this.sunLight.shadow.camera.bottom = -sLight;
    this.sunLight.shadow.camera.near = 1;
    this.sunLight.shadow.camera.far = dLight;
    this.sunLight.shadow.mapSize.x = 1024 * 2;
    this.sunLight.shadow.mapSize.y = 1024 * 2;
    this.scene.add(this.sunLight);
  }

  setSunPosition (position) {
    this.sunPosition = position;
    let sunXYZ = sphericalToCartesian(this.sunPosition);
    this.sunLight.position.set(sunXYZ[0], sunXYZ[1], sunXYZ[2]);
  }

  setSunColor (cssColor) {
    this.sunLight.color = new THREE.Color(cssColor);
  }

  renderScene () {
    let render = () => {
      this.controls.update();
      requestAnimationFrame(render);
      this.renderer.render(this.scene, this.camera);
    };

    render();
  }
}

export default Terrain;
