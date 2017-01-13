import React from 'react';
import {solarAngles} from './sun-position';
import Terrain from './terrain';


const TerrainView = React.createClass({
  propTypes: {
    lon: React.PropTypes.number.isRequired,
    lat: React.PropTypes.number.isRequired,
    zoom: React.PropTypes.number.isRequired,
    dateTime: React.PropTypes.object.isRequired,
    terrainLoading: React.PropTypes.bool.isRequired,
    terrainLoadComplete: React.PropTypes.func.isRequired
  },

  componentDidMount: function () {
    let angles = solarAngles(this.props.lon, this.props.lat, this.props.dateTime);
    this.terrain = new Terrain({divID: 'terrain-view',
                                zoom: this.props.zoom,
                                sunPosition: [35, angles.azimuth, angles.zenith],
                                terrainLoadComplete: this.props.terrainLoadComplete});
    this.terrain.initScene();
    // this.terrain.addHelpers();
    this.terrain.renderTile(this.props.lon, this.props.lat);
  },

  componentWillReceiveProps: function (nextProps) {
    if (!nextProps.dateTime.isSame(this.props.dateTime)) {
      let angles = solarAngles(this.props.lon, this.props.lat, nextProps.dateTime);
      this.terrain.setSunPosition([35, angles.azimuth, angles.zenith]);
    }
    if (nextProps.terrainLoading && !this.props.terrainLoading) {
      this.terrain.clearTile();
      this.terrain.renderTile(nextProps.lon, nextProps.lat);
    }
    if (nextProps.zoom !== this.props.zoom) {
      this.terrain.zoom = nextProps.zoom;
    }
  },

  render: function () {
    return <div id='terrain-view'/>;
  }
});

export default TerrainView;
