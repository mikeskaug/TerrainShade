import React from 'react';
let d3tile = require('d3-tile');
import { geoMercator } from 'd3-geo';
import { select, event as currentEvent } from 'd3-selection';
import { zoom, zoomTransform, zoomIdentity } from 'd3-zoom';

import { long2tile, lat2tile } from './tileUtilities';

const zoomLevelToMercator = (zoomLevel) => {
  return Math.pow(2, 11 + zoomLevel) / 2 / Math.PI;
}
const zoomLevelFromMercator = (zoomLevelInMercator) => {
  return Math.log(zoomLevelInMercator * 2 * Math.PI) / Math.LN2 - 11;
}

const getRegionTiles = (tiles, lon, lat) => {
// takes a set of image tiles and returns a new set of smaller tiles corresponding to +1 higher zoom level
  let regions = [];
  let regX = long2tile(lon, tiles[0][2]+1);
  let regY = lat2tile(lat, tiles[0][2]+1);

  tiles.forEach(tile => {
    regions.push([tile[0]*2, tile[1]*2, tile[2]+1])
    regions.push([tile[0]*2+1, tile[1]*2, tile[2]+1])
    regions.push([tile[0]*2, tile[1]*2+1, tile[2]+1])
    regions.push([tile[0]*2+1, tile[1]*2+1, tile[2]+1])
  });
  regions.forEach(region => {
    region.fill = (regX === region[0] && regY === region[1]) ? 'rgba(255,0,0,0.2)' : 'none'
  });
  return regions;
};

const MapSelector = React.createClass({

  componentDidMount: function () {
    let pi = Math.PI;
    let tau = 2 * pi;

    let width = 300;
    let height = 200;

    let svg = select('svg')
        .attr('width', width)
        .attr('height', height);

    let raster = svg.append('g');
    let outlines = svg.append('g');

    let projection = geoMercator()
        .scale(1 / tau)
        .translate([0, 0]);

    let imageTileLayout = d3tile.tile()
        .size([width, height]);

    let outlineTileLayout = d3tile.tile()
        .size([width, height]);

    const zoomed = () => {
      let transform = zoomTransform(svg.node());

      let imageTiles = imageTileLayout
          .scale(transform.k)
          .translate([transform.x, transform.y])
          ();

      let regionTiles = getRegionTiles(imageTiles, this.props.lon, this.props.lat);

      projection
          .scale(transform.k / tau)
          .translate([transform.x, transform.y]);

      let image = raster
          .attr('transform', stringify(imageTiles.scale, imageTiles.translate))
          .selectAll('image')
          .data(imageTiles, function(d) { return d; });

      let outlineLayer = outlines
          .attr('transform', stringify(imageTiles.scale, imageTiles.translate))
          .selectAll('rect')
          .data(regionTiles, function(d) { return d; });

      image.exit().remove();
      outlineLayer.exit().remove();

      image.enter()
            .append('image')
          .attr('xlink:href', function(d) { return 'http://' + 'abc'[d[1] % 3] + '.tile.openstreetmap.org/' + d[2] + '/' + d[0] + '/' + d[1] + '.png'; })
          .attr('x', d => { return d[0] * 256; })
          .attr('y', d => { return d[1] * 256; })
          .attr('width', 256)
          .attr('height', 256);

      outlineLayer.enter()
            .append('rect')
          .attr('x', d => { return d[0] * 128; })
          .attr('y', d => { return d[1] * 128; })
          .attr('fill', d => { return d.fill; })
          .attr('width', 128)
          .attr('height', 128);
    };

    let Zoom = zoom()
        .scaleExtent([1 << 10, 1 << 25])
        .on('zoom', zoomed);

    let center = projection([this.props.lon, this.props.lat]);
    let initialZoom = zoomLevelToMercator(this.props.zoom - 1);

    svg.call(Zoom)
        .call(Zoom.transform, zoomIdentity
            .translate(width / 2, height / 2)
            .scale(initialZoom)
            .translate(-center[0], -center[1]));
  },

  render: function () {
    return <div className='map-selector'><svg></svg></div>;
  }
})

const stringify = (scale, translate) => {
  let k = scale / 256, r = scale % 1 ? Number : Math.round;
  return 'translate(' + r(translate[0] * scale) + ',' + r(translate[1] * scale) + ') scale(' + k + ')';
}

export default MapSelector;
