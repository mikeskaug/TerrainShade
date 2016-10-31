import React from 'react';
let d3tile = require('d3-tile');
import { geoMercator, geoPath } from 'd3-geo';
import { select, event as currentEvent } from 'd3-selection';
import { zoom, zoomTransform, zoomIdentity } from 'd3-zoom';

const MapSelector = React.createClass({

  componentDidMount: function () {
    let pi = Math.PI;
    let tau = 2 * pi;

    let width = 300;
    let height = 200;

    let svg = select("svg")
        .attr("width", width)
        .attr("height", height);

    let raster = svg.append("g");

    let projection = geoMercator()
        .scale(1 / tau)
        .translate([0, 0]);

    let path = geoPath()
        .projection(projection);

    let tile = d3tile.tile()
        .size([width, height]);

    const zoomed = () => {
      let transform = zoomTransform(svg.node());

      let tiles = tile
          .scale(transform.k)
          .translate([transform.x, transform.y])
          ();

      projection
          .scale(transform.k / tau)
          .translate([transform.x, transform.y]);

      let image = raster
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
    };

    let Zoom = zoom()
        .scaleExtent([1, 14])
        .on("zoom", zoomed);

    let center = projection([this.props.lon, this.props.lat]);

    svg.call(Zoom)
        .call(Zoom.transform, zoomIdentity
            .translate(width / 2, height / 2)
            .scale(50)
            .translate(-center[0], -center[1]));
  },

  render: function () {
    return <div><svg></svg></div>;
  }
})

const stringify = (scale, translate) => {
  let k = scale / 256, r = scale % 1 ? Number : Math.round;
  return "translate(" + r(translate[0] * scale) + "," + r(translate[1] * scale) + ") scale(" + k + ")";
}

export default MapSelector;
