import 'whatwg-fetch';
import _ from 'underscore';

const baseURL = 'https://terrain-preview.mapzen.com/terrarium';

export var long2tile = (lon, zoom) => {
    return (Math.floor( (lon + 180) / 360 * Math.pow(2, zoom) ) );
}
 
export var lat2tile = (lat, zoom) => {
    return (Math.floor( (1 - Math.log( Math.tan( lat * Math.PI / 180)
            + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
}

export var fetchElevationTile = (lon, lat, zoom) => {
    let x = long2tile(lon, zoom);
    let y = lat2tile(lat, zoom);
    let url = baseURL + '/' + zoom + '/' + x + '/' + y + '.png';
    
    return fetch(url);

}

export var getElevationsFromRGBA = (rgbaData) => {
    let elevations = [];
    let indices = _.range(0, rgbaData.length, 4);
    
    indices.forEach((item, index) => {
        let pixel = rgbaData.slice(item, item + 3);
        let ele = (pixel[0] * 256 + pixel[1] + pixel[2] / 256) - 32768;
        elevations.push(ele);    
    });
    return elevations;
}

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

export var getTileDimensions = (lon, lat, zoom) => {
    let delLon = 360 / Math.pow(2, zoom);
    let delLat = 170.1 / Math.pow(2, zoom);
    let tileDimensions = degreesToMeters(lon, lat, delLon, delLat);
    return tileDimensions;
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


