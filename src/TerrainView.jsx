import React from 'react';
import chroma from 'chroma-js';
import {solarAngles} from './sun-position';
import Terrain from './terrain';


const TerrainView = React.createClass({
  propTypes: {
    lon: React.PropTypes.number.isRequired,
    lat: React.PropTypes.number.isRequired,
    zoom: React.PropTypes.number.isRequired,
    dateTime: React.PropTypes.object.isRequired,
    terrainLoading: React.PropTypes.bool.isRequired,
    terrainLoadComplete: React.PropTypes.func.isRequired,
    terrainView: React.PropTypes.string.isRequired
  },

  componentDidMount: function () {
    let angles = solarAngles(this.props.lon, this.props.lat, this.props.dateTime);
    this.terrain = new Terrain({divID: 'terrain-view',
      zoom: this.props.zoom,
      sunPosition: [35, angles.azimuth, angles.zenith],
      terrainLoadComplete: this.props.terrainLoadComplete});
    this.terrain.initScene();
    this.terrain.setView(this.props.terrainView);
    this.terrain.scene.background.setStyle(this.backgroundColor(angles.zenith).css());
    // this.terrain.addHelpers();
    this.terrain.renderTile(this.props.lon, this.props.lat);
  },

  componentWillReceiveProps: function (nextProps) {
    if (!nextProps.dateTime.isSame(this.props.dateTime)) {
      let angles = solarAngles(this.props.lon, this.props.lat, nextProps.dateTime);
      this.terrain.setSunPosition([35, angles.azimuth, angles.zenith]);
      this.terrain.scene.background.setStyle(this.backgroundColor(angles.zenith).css());
    }
    if (nextProps.terrainLoading && !this.props.terrainLoading) {
      this.terrain.clearTile();
      this.terrain.renderTile(nextProps.lon, nextProps.lat);
    }
    if (nextProps.zoom !== this.props.zoom) {
      this.terrain.zoom = nextProps.zoom;
    }
    if (nextProps.terrainView !== this.props.terrainView) {
      this.terrain.setView(nextProps.terrainView);
    }
  },

  render: function () {
    return <div id='terrain-view'/>;
  },

  backgroundColor: chroma.scale([[128, 128, 128], [255, 255, 255]]).domain([90, 0])

  // backgroundColor: function (sunAngle) {
  //   let ratio = (90 - sunAngle) / 90;
  //   let domain = [50, 100];
  //   let domainDiff = domain[1] - domain[0];
  //   let value = Math.round(domain[0] + ratio * domainDiff);
  //   return 'rgb(' + value + '%, ' + value + '%, ' + value + '%)';
  // }
});

export default TerrainView;
