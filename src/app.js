
import Terrain from './terrain';


const lon = -105.250;
const lat = 39.9266;


let terrain = new Terrain();
terrain.initScene();
terrain.addHelpers();
terrain.renderTile(lon, lat);
