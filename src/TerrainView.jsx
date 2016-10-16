import React from 'react';
import {solarAngles} from './sun-position';
import Terrain from './terrain';


const TerrainView = React.createClass({

  componentDidMount: function () {
    let angles = solarAngles(this.props.lon, this.props.lat, this.props.dateTime);
    console.log(angles)
    this.terrain = new Terrain({divID: 'terrain-view',
                                sunPostion: [35, angles.azimuth, angles.zenith]});
    this.terrain.initScene();
    this.terrain.addHelpers();
    this.terrain.renderTile(this.props.lon, this.props.lat);
  },

  componentWillReceiveProps: function (nextProps) {
    if (!nextProps.dateTime.isSame(this.props.dateTime)) {
      let angles = solarAngles(this.props.lon, this.props.lat, nextProps.dateTime);
      this.terrain.setSunPosition([35, angles.azimuth, angles.zenith]);
    }
  },

  render: function () {
    return <div id='terrain-view'></div>;
  }
});

export default TerrainView;
