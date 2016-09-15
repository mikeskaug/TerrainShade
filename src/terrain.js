let THREE = require( 'three' );
import Trackballcontrols from 'three-trackballcontrols';

import { fetchElevationTile, getElevationsFromRGBA, arrayMean, arrayRange ,getTileDimensions } from './utils';

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
                this.addTerrainToScene(elevations);
                this.renderScene();
            });
	
    }
    
    getElevationData (lon, lat) {
        let reader = new FileReader();
        reader.addEventListener("loadend", function() {
            let rawTileData = new Uint16Array(reader.result);
        });
        
        let fetchResponse = fetchElevationTile(lon, lat, this.zoom);
        
        return fetchResponse.then( response => { return response.blob() })
            .then( blob => {
                reader.readAsArrayBuffer(blob);
                let url = URL.createObjectURL(blob);
                let img = document.createElement("img");
                img.src = url;
                return new Promise( (resolve, reject) => {img.onload = resolve(img);})
            })
            .then( img => {
                let canvas = document.createElement("canvas");
                let ctx = canvas.getContext("2d");
                canvas.height = img.height;
                canvas.width = img.width;
                ctx.drawImage(img, 0, 0, img.height, img.width);
                    
                var map = ctx.getImageData(0,0,img.width,img.height);
                var imdata = map.data;
                let elevations = getElevationsFromRGBA(imdata);
                return elevations;
            });
    }
    
    addAxes () {
        let axes = new THREE.AxisHelper(100);
        this.scene.add(axes);
    }

    addTerrainToScene (elevations)  {
        let gridUnits = Math.sqrt(elevations.length);
        let meshSize = 60;
        let geometry = new THREE.PlaneGeometry(meshSize, meshSize, gridUnits - 1, gridUnits - 1);
        let meanElevation = arrayMean(elevations);
        let tileDimensions = getTileDimensions(lon, lat, zoom);
        let meshUnitsPerMeter = meshSize / tileDimensions.y;
        
        for (var i = 0, l = geometry.vertices.length; i < l; i++) {
            geometry.vertices[i].z = (elevations[i] - meanElevation) * meshUnitsPerMeter;
        };
        
        var material = new THREE.MeshBasicMaterial({
            color: 0x000000, 
            wireframe: true
        });
        let terrain = new THREE.Mesh( geometry, material );
        this.scene.add( terrain );
    }
    
    renderScene () {
        let render = () => {
            this.controls.update(); 
            requestAnimationFrame( render );
            this.renderer.render(scene, camera);
        };
        
        render();
    }
}

export default Terrain;