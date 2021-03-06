import _ from 'underscore';
import 'whatwg-fetch';
import moment from 'moment';

export let arrayMean = (array) => {
  let sum = _.reduce(array, (memo, num) => {return memo + num;});
  return sum / array.length;
};

export let arrayRange = (array) => {
  return _.max(array) - _.min(array);
};

export let degreesToMeters = (lon, lat, delLon, delLat) => {
  const R = 6371000;
  let dLon = delLon * Math.PI / 180;
  let a = Math.cos(lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let metersX = R * c;

  let dLat = delLat * Math.PI / 180;
  a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180);
  c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let metersY = R * c;

  metersY = delLat * Math.PI / 180 * R;
  return {x: metersX, y: metersY};
};

export let png2Array = (png) => {
  // converts png object (see https://github.com/arian/pngjs) into array of pixel data
  let dataArray = [];
  _.range(png.getHeight()).map(row => {
    _.range(png.getWidth()).map(col => {
      png.getPixel(col, row).map(val => dataArray.push(val));
    });
  });
  return dataArray;
};

export let sphericalToCartesian = ([R, azimuthDegrees, zenithDegrees]) => {
  // R, azimuth and zenith are spherical coordinates in degrees and Three.js units
  let theta = (90 - azimuthDegrees) * Math.PI / 180; // solar azimuth measured from north
  let phi = zenithDegrees * Math.PI / 180; // zenith measured from straight up (along z_hat)
  let x = R * Math.sin(phi) * Math.cos(theta);
  let y = R * Math.sin(phi) * Math.sin(theta);
  let z = R * Math.cos(phi);

  return [x, y, z];
};

export let hoursTohhmm = (hours) => {
  let hour = Math.floor(hours);
  let min = Math.floor((hours * 60) % 60);
  return {hour: hour, minute: min};
};

export let hhmmTohours = (hhmm) => {
  return hhmm.hour + hhmm.minute / 60;
};

export let setLocalTime = (lon, lat, utc, callback) => {
  let baseURL = 'https://maps.googleapis.com/maps/api/timezone/';
  let format = 'json';
  let parameters = '?' + 'location=' + lat + ',' + lon + '&' + 'timestamp=' + utc.format('X');
  let key = '&key=AIzaSyAsthjhQu3xLChz3XT5aypNKxU_OLyxILE';
  let url = baseURL + format + parameters + key;
  fetch(url).then(response => {
    if (response.status !== 200) {
      callback(utc);
      return;
    }
    response.json().then(data => {
      let localDt = utc.clone().utcOffset((data.dstOffset + data.rawOffset) / 60);
      callback(localDt);
    });
  });
};
