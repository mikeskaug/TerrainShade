import React from 'react';

import Terrain from './terrain';


const TerrainView = React.createClass({

  componentDidMount: function () {
    this.terrain = new Terrain({divID: 'terrain-view',
                                sunPostion: [35, this.props.sunAzimuth, this.props.sunZenith]});
    this.terrain.initScene();
    // this.terrain.addHelpers();
    this.terrain.renderTile(this.props.lon, this.props.lat);
  },

  componentWillReceiveProps: function (nextProps) {
    if (nextProps.sunZenith !== this.props.sunZenith) {
      this.terrain.setSunPosition([35, this.props.sunAzimuth, nextProps.sunZenith]);
    }
  },

  render: function () {
    return <div id='terrain-view'></div>;
  }
});

export default TerrainView;
