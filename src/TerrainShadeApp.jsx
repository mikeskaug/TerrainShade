import React from 'react';

import TerrainView from './TerrainView';

const TerrainShadeApp = React.createClass({
  getInitialState: function () {
    return {
      lon: -105.250,
      lat: 39.9266,
      sunZenith: 85,
      sunAzimuth: 90,
    }
  },

  render: function () {
    return (
      <div>
        <TerrainView
          lon={this.state.lon}
          lat={this.state.lat}
          sunZenith={this.state.sunZenith}
          sunAzimuth={this.state.sunAzimuth}/>
      </div>
    )
  }
});

export default TerrainShadeApp;
