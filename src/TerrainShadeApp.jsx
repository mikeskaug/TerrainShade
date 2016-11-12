import React from 'react';
import moment from 'moment';
import TerrainView from './TerrainView';
import MapSelector from './MapSelector';
import Datetime from 'react-datetime';

const TerrainShadeApp = React.createClass({
  getInitialState: function () {
    return {
      lon: -105.250,
      lat: 39.9266,
      zoom: 13,
      dateTime: moment(),
    }
  },

  render: function () {
    return (
      <div>
        <Datetime value={this.state.dateTime}
                  dateFormat='MMM D YYYY'
                  timeFormat={false}
                  closeOnSelect={true}
                  onChange={this.handleDateChange}/>
        <label htmlFor='hour-slider'>Hour</label>
        <input type='range'
               min='0'
               max='24'
               step='1'
               id='hour-slider'
               value={this.state.dateTime.hour()}
               onChange={this.handleHourChange}/>
        {this.state.dateTime.hour()}
        <MapSelector lon={this.state.lon}
                     lat={this.state.lat}
                     zoom={this.state.zoom}/>
        <TerrainView
          lon={this.state.lon}
          lat={this.state.lat}
          zoom={this.state.zoom}
          dateTime={this.state.dateTime}/>
      </div>
    )
  },

  handleHourChange: function (event) {
    let newDateTime = this.state.dateTime.clone().hour(event.target.value);
    this.setState({dateTime: newDateTime});
  },

  handleDateChange: function (date) {
    let newDate = this.state.dateTime.clone();
    newDate.set({'year': date.year(),'month': date.month(),'date': date.date()});
    this.setState({dateTime: newDate});
  }
});

export default TerrainShadeApp;
