import React from 'react';
import moment from 'moment';
import TerrainView from './TerrainView';
import MapSelectorView from './MapSelectorView';
import { hoursTohhmm, hhmmTohours } from './utils';
import Datetime from 'react-datetime';

const TerrainShadeApp = React.createClass({
  getInitialState: function () {
    return {
      lon: -105.250,
      lat: 39.9266,
      zoom: 13,
      dateTime: moment()
    };
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
               step='0.1'
               id='hour-slider'
               value={this.getFractionalHours()}
               onChange={this.handleTimeChange}/>
             {this.state.dateTime.format('h:mm')}
        <MapSelectorView
          lon={this.state.lon}
          lat={this.state.lat}
          zoom={this.state.zoom}
          updateLocation={this.handleLocationChange}
          updateZoom={this.handleZoomLevelChange}/>
        <TerrainView
          lon={this.state.lon}
          lat={this.state.lat}
          zoom={this.state.zoom}
          dateTime={this.state.dateTime}/>
      </div>
    );
  },

  getFractionalHours: function () {
    return hhmmTohours({hour: this.state.dateTime.hour(),
      minute: this.state.dateTime.minute()});
  },

  handleTimeChange: function (event) {
    let newTime = hoursTohhmm(event.target.value);
    let newDateTime = this.state.dateTime.clone().set(newTime);
    this.setState({dateTime: newDateTime});
  },

  handleDateChange: function (date) {
    let newDate = this.state.dateTime.clone();
    newDate.set({year: date.year(), month: date.month(), date: date.date()});
    this.setState({dateTime: newDate});
  },

  handleLocationChange: function (coords) {
    this.setState({lon: coords[0], lat: coords[1]});
  },

  handleZoomLevelChange: function (zoom) {
    this.setState({zoom: zoom});
  }

});

export default TerrainShadeApp;
