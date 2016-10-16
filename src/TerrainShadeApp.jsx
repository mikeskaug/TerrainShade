import React from 'react';
import moment from 'moment';
import TerrainView from './TerrainView';

const TerrainShadeApp = React.createClass({
  getInitialState: function () {
    return {
      lon: -105.250,
      lat: 39.9266,
      dateTime: moment(),
    }
  },

  render: function () {
    return (
      <div>
        <label htmlFor='hour-slider'>Hour</label>
        <input type='range'
               min='0'
               max='24'
               step='1'
               id='hour-slider'
               value={this.state.dateTime.hour()}
               onChange={this.handleHourChange}/>
        {this.state.dateTime.hour()}
        <TerrainView
          lon={this.state.lon}
          lat={this.state.lat}
          dateTime={this.state.dateTime}/>
      </div>
    )
  },

  handleHourChange: function (event) {
    let newDateTime = this.state.dateTime.clone().hour(event.target.value);
    this.setState({dateTime: newDateTime});
  }
});

export default TerrainShadeApp;
