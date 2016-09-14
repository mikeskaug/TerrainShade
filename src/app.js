let THREE = require( 'three' );
import Trackballcontrols from 'three-trackballcontrols';

import { fetchElevationTile, getElevationsFromRGBA, arrayMean, arrayRange ,getTileDimensions } from './utils';

const lon = -105.3045;
const lat = 39.9266;
const zoom = 13;

let scene = new THREE.Scene();
scene.background = new THREE.Color( 'rgb(255, 255, 255)' );
let axes = new THREE.AxisHelper(100);
scene.add(axes);
let camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.set(20, -80, 500);
let controls = new TrackballControls(camera);

let renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let renderTerrain = (elevations) => {
	let gridUnits = Math.sqrt(elevations.length);
	let meshSize = 60;
	let geometry = new THREE.PlaneGeometry(meshSize, meshSize, gridUnits - 1, gridUnits - 1);
	let meanElevation = arrayMean(elevations);
	let tileDimensions = getTileDimensions(lon, lat, zoom);
	let unitLength = meshSize / gridUnits;
	let meshUnitsPerMeter = meshSize / tileDimensions.y;
	
	for (var i = 0, l = geometry.vertices.length; i < l; i++) {
		geometry.vertices[i].z = (elevations[i] - meanElevation) * meshUnitsPerMeter;
    };
	
	var material = new THREE.MeshBasicMaterial({
		color: 0x000000, 
		wireframe: true
    });
	let terrain = new THREE.Mesh( geometry, material );
	scene.add( terrain );
	
	var render = function () {
		controls.update(); 
		requestAnimationFrame( render );
		renderer.render(scene, camera);
	};
	
	render();	
};

let reader = new FileReader();
reader.addEventListener("loadend", function() {
	let rawTileData = new Uint16Array(reader.result);
});

let fetchResponse = fetchElevationTile(lon, lat, zoom);

fetchResponse.then( response => { return response.blob() })
	.then( blob => {
		reader.readAsArrayBuffer(blob);
		let url = URL.createObjectURL(blob);
		let img = document.createElement("img");
		img.src = url;
		
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		
		img.onload = () => {
			canvas.height = img.height;
			canvas.width = img.width;
			ctx.drawImage(img, 0, 0, img.height, img.width);
				
			var map = ctx.getImageData(0,0,img.width,img.height);
			var imdata = map.data;
			let elevations = getElevationsFromRGBA(imdata);
			renderTerrain(elevations);
		};

	});
	
	
	