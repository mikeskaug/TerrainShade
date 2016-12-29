let d3tile = require('d3-tile');
import { geoMercator } from 'd3-geo';
import { select, mouse } from 'd3-selection';
import { zoom, zoomTransform, zoomIdentity } from 'd3-zoom';

import { long2tile, lat2tile } from './tileUtilities';

const pi = Math.PI;
const tau = 2 * pi;
const zoomLevelToMercator = (zoomLevel) => {
  return Math.pow(2, 11 + zoomLevel) / 2 / Math.PI;
};

// const zoomLevelFromMercator = (zoomLevelInMercator) => {
//   return Math.log(zoomLevelInMercator * 2 * Math.PI) / Math.LN2 - 11;
// };

const isNewTile = (newPosition, oldPosition, currentZoom) => {
  let newTile = [long2tile(newPosition[0], currentZoom), lat2tile(newPosition[1], currentZoom)];
  let oldTile = [long2tile(oldPosition[0], currentZoom), lat2tile(oldPosition[1], currentZoom)];
  return (newTile[0] !== oldTile[0] || newTile[1] !== oldTile[1]) ? true : false;
};

const stringify = (scale, translate) => {
  let k = scale / 256;
  let r = scale % 1 ? Number : Math.round;
  return 'translate(' + r(translate[0] * scale) + ','
          + r(translate[1] * scale) + ') scale(' + k + ')';
};

const getRegionTiles = (tiles, lon, lat) => {
// takes a set of image tiles and returns a new set of smaller tiles
// corresponding to +1 higher zoom level
  let regions = [];
  let regX = long2tile(lon, tiles[0][2] + 1);
  let regY = lat2tile(lat, tiles[0][2] + 1);

  tiles.forEach(tile => {
    regions.push([tile[0] * 2, tile[1] * 2, tile[2] + 1]);
    regions.push([tile[0] * 2 + 1, tile[1] * 2, tile[2] + 1]);
    regions.push([tile[0] * 2, tile[1] * 2 + 1, tile[2] + 1]);
    regions.push([tile[0] * 2 + 1, tile[1] * 2 + 1, tile[2] + 1]);
  });
  regions.forEach(region => {
    region.fill = (regX === region[0] && regY === region[1]) ? 'rgba(255,0,0,0.2)' : 'none';
  });
  return regions;
};

class MapSelector {
  constructor (args) {
    this.width = 300;
    this.height = 200;
    this.lon = args.lon;
    this.lat = args.lat;
    this.zoom = args.zoom;
    this.updateLocation = args.updateLocation;
    this.updateZoom = args.updateZoom;

    this.svg = select(args.el)
        .attr('width', this.width)
        .attr('height', this.height);

    this.raster = this.svg.append('g');
    this.outlines = this.svg.append('g');

    this.projection = geoMercator()
        .scale(1 / tau)
        .translate([0, 0]);

    this.imageTileLayout = d3tile.tile()
        .size([this.width, this.height]);

    this.outlineTileLayout = d3tile.tile()
        .size([this.width, this.height]);
  }

  initMap () {
    this.svg.on('click', () => {
      let mouseCoords = mouse(this.svg.node());
      let newPosition = this.projection.invert(mouseCoords);
      let currentPosition = [this.lon, this.lat];
      if (isNewTile(newPosition, currentPosition, this.zoom)) {
        this.updateLocation(newPosition);
      }
    });

    let zoomed = () => {
      let transform = zoomTransform(this.svg.node());
      this.projection
          .scale(transform.k / tau)
          .translate([transform.x, transform.y]);
      this.updateImageTiles(transform);
      this.updateRegionTiles();
    };

    let Zoom = zoom()
        .scaleExtent([1 << 10, 1 << 25])
        .on('zoom', zoomed);

    let center = this.projection([this.lon, this.lat]);
    let initialZoom = zoomLevelToMercator(this.zoom - 1);
    this.svg.call(Zoom)
        .call(Zoom.transform, zoomIdentity
            .translate(this.width / 2, this.height / 2)
            .scale(initialZoom)
            .translate(-center[0], -center[1]));
  }

  updateImageTiles (transform) {
    this.imageTiles = this.imageTileLayout
        .scale(transform.k)
        .translate([transform.x, transform.y])();

    if (this.imageTiles[0][2] + 1 !== this.zoom) {
      this.updateZoom(this.imageTiles[0][2] + 1);
    }

    let image = this.raster
        .attr('transform', stringify(this.imageTiles.scale, this.imageTiles.translate))
        .selectAll('image')
        .data(this.imageTiles, d => d);

    image.exit().remove();
    image.enter()
          .append('image')
        .attr('xlink:href', function (d) {
          return 'http://' + 'abc'[d[1] % 3] + '.tile.openstreetmap.org/'
                  + d[2] + '/' + d[0] + '/' + d[1] + '.png';
        })
        .attr('x', d => d[0] * 256)
        .attr('y', d => d[1] * 256)
        .attr('width', 256)
        .attr('height', 256);
  }

  updateRegionTiles () {
    let regionTiles = getRegionTiles(this.imageTiles, this.lon, this.lat);
    let outlineLayer = this.outlines
        .attr('transform', stringify(this.imageTiles.scale, this.imageTiles.translate))
        .selectAll('rect')
        .data(regionTiles, d => d);

    outlineLayer.exit().remove();

    outlineLayer.enter()
          .append('rect')
        .attr('x', d => d[0] * 128)
        .attr('y', d => d[1] * 128)
        .attr('fill', d => d.fill)
        .attr('width', 128)
        .attr('height', 128);
  }
}

export default MapSelector;
