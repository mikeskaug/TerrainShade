import React from 'react';
import moment from 'moment';
import TerrainView from './TerrainView';
import MapSelectorView from './MapSelectorView';
import { hoursTohhmm, hhmmTohours, setLocalTime } from './utils';
import Datetime from 'react-datetime';
import Geosuggest from 'react-geosuggest';
import { Button } from 'react-bootstrap';

const TerrainShadeApp = React.createClass({
  getInitialState: function () {
    return {
      lon: -105.250,
      lat: 39.9266,
      zoom: 13,
      dateTime: moment.utc(),
      terrainLoad: false,
      terrainView: 'perspective'
    };
  },

  componentWillMount: function () {
    setLocalTime(this.state.lon, this.state.lat, this.state.dateTime, this.setTime);
  },

  render: function () {
    return (
      <div>
        <div className='header'><h2>TerrainShade</h2></div>
        <div className='content'>
          <div className='control-panel'>
            <Datetime value={this.state.dateTime}
                      dateFormat='MMM D YYYY'
                      timeFormat={false}
                      className='control'
                      closeOnSelect={true}
                      onChange={this.handleDateChange}/>
            <div className='control'>
              <div className='time-label'>{this.state.dateTime.format('h:mma')}</div>
              <input type='range'
                     min='0'
                     max='24'
                     step='0.01666'
                     id='hour-slider'
                     value={this.getFractionalHours()}
                     onChange={this.handleTimeChange}/>
            </div>
            <div className='control'>
              <MapSelectorView
                lon={this.state.lon}
                lat={this.state.lat}
                zoom={this.state.zoom}
                updateLocation={this.handleLocationChange}
                updateZoom={this.handleZoomLevelChange}/>
              <Geosuggest
                ref={ el => {this.geoSuggest = el;}}
                onFocus={this.handleGeoSuggestFocus}
                onBlur={this.handleGeoSuggestBlur}
                onSuggestSelect={this.onLocationSelect}
                suggestsClassName='suggest-list'
                suggestItemClassName='suggest-item'/>
            </div>
          </div>
          <div className='terrain-view'>
            <Button onClick={this.handleTerrainRefresh}>
              <i className='material-icons md-36'>refresh</i>
            </Button>
            <Button onClick={this.handleSwitchToPerspectiveView}
                    active={this.state.terrainView === 'perspective'}>Perspective</Button>
            <Button onClick={this.handleSwitchToOrthoView}
                    active={this.state.terrainView === 'ortho'}>Ortho</Button>
            <TerrainView
              lon={this.state.lon}
              lat={this.state.lat}
              zoom={this.state.zoom}
              dateTime={this.state.dateTime}
              terrainLoading={this.state.terrainLoad}
              terrainLoadComplete={this.handleTerrainLoadComplete}
              terrainView={this.state.terrainView}/>
          </div>
        </div>
      </div>
    );
  },

  getFractionalHours: function () {
    return hhmmTohours({hour: this.state.dateTime.hour(),
      minute: this.state.dateTime.minute()});
  },

  setTime: function (dt) {
    this.setState({dateTime: dt});
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

  onLocationSelect: function (suggest) {
    this.setState({lon: suggest.location.lng, lat: suggest.location.lat});
    setLocalTime(suggest.location.lng, suggest.location.lat, this.state.dateTime, this.setTime);
  },

  handleLocationChange: function (coords) {
    this.setState({lon: coords[0], lat: coords[1]});
    setLocalTime(coords[0], coords[1], this.state.dateTime, this.setTime);
  },

  handleZoomLevelChange: function (zoom) {
    this.setState({zoom: zoom});
  },

  handleTerrainRefresh: function () {
    this.setState({terrainLoad: true});
  },

  handleTerrainLoadComplete: function () {
    this.setState({terrainLoad: false});
  },

  handleSwitchToOrthoView: function () {
    this.setState({terrainView: 'ortho'});
  },

  handleSwitchToPerspectiveView: function () {
    this.setState({terrainView: 'perspective'});
  },

  handleGeoSuggestFocus: function () {
    this.geoSuggest.focus();
  },

  handleGeoSuggestBlur: function () {
    this.geoSuggest.blur();
  }

});

export default TerrainShadeApp;
