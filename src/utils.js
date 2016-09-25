import _ from 'underscore';


export var arrayMean = (array) => {
    let sum = _.reduce(array, (memo, num) => {return memo + num});
    return sum / array.length;
};

export var arrayRange = (array) => {
    return _.max(array) - _.min(array);
};

let degreesToMeters = (lon, lat, delLon, delLat) => {
    const R = 6371000; // m
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

export var png2Array = (png) => {
    // converts png object (see https://github.com/arian/pngjs) into array of pixel data
    let dataArray = [];
    _.range(png.getHeight()).map(row => {
        _.range(png.getWidth()).map(col => {
            png.getPixel(col, row).map(val => dataArray.push(val));
        });
    });
    return dataArray;
};
