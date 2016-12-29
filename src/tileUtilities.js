import 'whatwg-fetch';
import _ from 'underscore';

import { degreesToMeters } from './utils';

const baseElevationURL = 'https://terrain-preview.mapzen.com/terrarium';
const baseImageURL = 'https://a.dyn.tile.stamen.com/terrain';

export const long2tile = (lon, zoom) => {
  return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
};

export const lat2tile = (lat, zoom) => {
  return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180)
          + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
};

export const fetchElevationTile = (lon, lat, zoom) => {
  let x = long2tile(lon, zoom);
  let y = lat2tile(lat, zoom);
  let url = baseElevationURL + '/' + zoom + '/' + x + '/' + y + '.png';

  return fetch(url);
};

export const getImageTileURL = (lon, lat, zoom) => {
  let x = long2tile(lon, zoom);
  let y = lat2tile(lat, zoom);
  let url = baseImageURL + '/' + zoom + '/' + x + '/' + y + '.png';

  return url;
};

export const getElevationsFromRGBA = (rgbaData) => {
  let elevations = [];
  let indices = _.range(0, rgbaData.length, 4);

  indices.forEach((item) => {
    let pixel = rgbaData.slice(item, item + 3);
    let ele = (pixel[0] * 256 + pixel[1] + pixel[2] / 256) - 32768;
    elevations.push(ele);
  });
  return elevations;
};

export const getTileDimensions = (lon, lat, zoom) => {
  let delLon = 360 / Math.pow(2, zoom);
  let delLat = 170.1 / Math.pow(2, zoom);
  let tileDimensions = degreesToMeters(lon, lat, delLon, delLat);
  return tileDimensions;
};
