import React from 'react';
import moment from 'moment';
import TerrainView from './TerrainView';
import MapSelectorView from './MapSelectorView';
import { hoursTohhmm, hhmmTohours, setLocalTime } from './utils';
import Datetime from 'react-datetime';
import Geosuggest from 'react-geosuggest';
import { Button, Popover, OverlayTrigger } from 'react-bootstrap';

let orthoIcon = require('file-loader!./assets/ortho_icon.svg');
let perspectiveIcon = require('file-loader!./assets/perspective_icon.svg');

const creditPopover = (
  <Popover id='popover-positioned-right' title='Credit'>
    <strong>Elevation data:</strong>
      <a href='https://mapzen.com/documentation/terrain-tiles/'> Mapzen</a>,
      U.S. Geological Survey,
      and U.S. National Oceanic and Atmospheric Administration
    <br/>
    <strong>Imagery:</strong> <a href='http://stamen.com'>Stamen Design</a>,
      under <a href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>.
      Data by <a href='http://openstreetmap.org'>OpenStreetMap</a>,
      under <a href='http://www.openstreetmap.org/copyright'>ODbL</a>.
  </Popover>
);

const TerrainShadeApp = React.createClass({
  getInitialState: function () {
    return {
      lon: 7.659876,
      lat: 45.976582,
      zoom: 11,
      dateTime: moment.utc(),
      terrainLoad: false,
      terrainView: 'perspective'
    };
  },

  componentDidMount: function () {
    this.runIntroAnimation();
  },

  componentWillUpdate: function (nextProps, nextState) {
    if (nextState.dateTime.isAfter(this.endDateTime)) {
      // stop the animation
      clearInterval(this.timer1);
    }
  },

  render: function () {
    return (
      <div>
        <div className='header'><div className='title'>TerrainShade</div></div>
        <div className='content'>
          <div className='control-panel'>
            <div className='date label'>Date</div>
            <Datetime value={this.state.dateTime}
                      dateFormat='MMM D YYYY'
                      timeFormat={false}
                      className='control'
                      closeOnSelect={true}
                      onChange={this.handleDateChange}/>
            <div className='control'>
              <div className='label'>Time</div>
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
              <div className='location label'>Location</div>
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
            <OverlayTrigger trigger='click' rootClose placement='right' overlay={creditPopover}>
              <i className='credit material-icons md-36'>info_outline</i>
            </OverlayTrigger>
          </div>
          <div className='terrain-view'>
            <TerrainView
              lon={this.state.lon}
              lat={this.state.lat}
              zoom={this.state.zoom}
              dateTime={this.state.dateTime}
              terrainLoading={this.state.terrainLoad}
              terrainLoadComplete={this.handleTerrainLoadComplete}
              terrainView={this.state.terrainView}/>
            <div className='overlay'>
              <Button className='refresh' onClick={this.handleTerrainRefresh}>
                <span>Reload</span><i className='material-icons md-36'>refresh</i>
              </Button>
              <div className='camera-selectors'>
                <Button onClick={this.handleSwitchToPerspectiveView}
                        bsClass='perspective-selector btn'
                        active={this.state.terrainView === 'perspective'}>
                        <img width='60%' height='60%' src={perspectiveIcon}/>
                </Button>
                <Button onClick={this.handleSwitchToOrthoView}
                        bsClass='ortho-selector btn'
                        active={this.state.terrainView === 'ortho'}>
                        <img width='65%' height='65%' src={orthoIcon}/>
                </Button>
              </div>
            </div>
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

  runIntroAnimation: function () {
    let startDateTime = moment.utc().hour(12);
    let interval = 4; // hours of daylight change to animate
    let duration = 3000; // total duration of animation in milliseconds
    let dt = 0.1; // time step of the animation in milliseconds
    let dh = interval / duration / dt; // time change during each animation step in hours
    this.endDateTime = startDateTime.clone().add(interval, 'h');

    let incrementTime = () => {
      this.setState({dateTime: this.state.dateTime.clone().add(dh, 'h')});
    };

    this.setState({dateTime: startDateTime});
    this.timer1 = setInterval(incrementTime, dt);
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
