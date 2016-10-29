import React from 'react';
let d3tile = require('d3-tile');
import { geoMercator, geoPath } from 'd3-geo';
import { select, event } from 'd3-selection';
import { zoom } from 'd3-zoom';

const MapSelector = ({lon, lat}) => {
  let pi = Math.PI;
  let tau = 2 * pi;

  let width = Math.max(260, window.innerWidth);
  let height = Math.max(100, window.innerHeight);

  let projection = geoMercator()
      .scale(1 / tau)
      .translate([0, 0]);

  let path = geoPath()
      .projection(projection);

  let tile = tile()
      .size([width, height]);

  let zoom = zoom()
      .scaleExtent([1 << 11, 1 << 14])
      .on("zoom", zoomed);

  let svg = select("svg")
      .attr("width", width)
      .attr("height", height);

  let raster = svg.append("g");

  let center = projection([lon, lat]);

  svg.call(zoom)
      .call(zoom.transform, d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(1 << 12)
          .translate(-center[0], -center[1]));

  return <div><svg></svg></div>;
}

let zoomed = () => {
  var transform = d3event.transform;

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

export default MapSelector;
