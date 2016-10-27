import React from 'react';
let tile = require('d3-tile');
import {geoMercator, geoPath} from 'd3';

export const MapSelector = ({lon, lat}) => {
  let pi = Math.PI;
  let tau = 2 * pi;

  let width = Math.max(960, window.innerWidth);
  let height = Math.max(500, window.innerHeight);

  let projection = d3.geoMercator()
      .scale(1 / tau)
      .translate([0, 0]);

  let path = d3.geoPath()
      .projection(projection);

  let tile = d3.tile()
      .size([width, height]);

  let zoom = d3.zoom()
      .scaleExtent([1 << 11, 1 << 14])
      .on("zoom", zoomed);

  let svg = d3.select("svg")
      .attr("width", width)
      .attr("height", height);

  let raster = svg.append("g");

  let center = projection([-98.5, 39.5]);

  svg.call(zoom)
      .call(zoom.transform, d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(1 << 12)
          .translate(-center[0], -center[1]));

  let zoomed = () => {
    var transform = d3.event.transform;

    var tiles = tile
        .scale(transform.k)
        .translate([transform.x, transform.y])
        ();

    projection
        .scale(transform.k / tau)
        .translate([transform.x, transform.y]);

    var image = raster
        .attr("transform", stringify(tiles.scale, tiles.translate))
        .selectAll("image")
        .data(tiles, function(d) { return d; });

    image.exit().remove();

    image.enter().append("image")
        .attr("xlink:href", function(d) { return "http://" + "abc"[d[1] % 3] + ".tile.openstreetmap.org/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
        .attr("x", function(d) { return d[0] * 256; })
        .attr("y", function(d) { return d[1] * 256; })
        .attr("width", 256)
        .attr("height", 256);
  }

  let stringify = (scale, translate) => {
    var k = scale / 256, r = scale % 1 ? Number : Math.round;
    return "translate(" + r(translate[0] * scale) + "," + r(translate[1] * scale) + ") scale(" + k + ")";
  }

}
