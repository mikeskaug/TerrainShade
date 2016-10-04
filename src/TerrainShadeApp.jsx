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
        <label htmlFor='zenith-angle-slider'>Sun Zenith</label>
        <input type='range'
               min='-89'
               max='89'
               step='1'
               id='zenith-angle-slider'
               value={this.state.sunZenith}
               onChange={this.handleZenithChange}/>
        <TerrainView
          lon={this.state.lon}
          lat={this.state.lat}
          sunZenith={this.state.sunZenith}
          sunAzimuth={this.state.sunAzimuth}/>
      </div>
    )
  },

  handleZenithChange: function (event) {
    this.setState({sunZenith: event.target.value});
  }
});

export default TerrainShadeApp;
