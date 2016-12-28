import React from 'react';
import {solarAngles} from './sun-position';
import Terrain from './terrain';


const TerrainView = React.createClass({

  componentDidMount: function () {
    let angles = solarAngles(this.props.lon, this.props.lat, this.props.dateTime);
    this.terrain = new Terrain({divID: 'terrain-view',
                                zoom: this.props.zoom,
                                sunPosition: [35, angles.azimuth, angles.zenith]});
    this.terrain.initScene();
    this.terrain.addHelpers();
    this.terrain.renderTile(this.props.lon, this.props.lat);
  },

  componentWillReceiveProps: function (nextProps) {
    if (!nextProps.dateTime.isSame(this.props.dateTime)) {
      let angles = solarAngles(this.props.lon, this.props.lat, nextProps.dateTime);
      this.terrain.setSunPosition([35, angles.azimuth, angles.zenith]);
    }
    if (nextProps.lon !== this.props.lon || nextProps.lat !== this.props.lat) {
      this.terrain.clearTile();
      this.terrain.renderTile(nextProps.lon, nextProps.lat);
    }
    if (nextProps.zoom != this.props.zoom) {
      this.terrain.zoom = nextProps.zoom;
      this.terrain.clearTile();
      this.terrain.renderTile(nextProps.lon, nextProps.lat);
    }
  },

  render: function () {
    return <div id='terrain-view'></div>;
  }
});

export default TerrainView;
