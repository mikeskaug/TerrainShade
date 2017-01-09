import React from 'react';

import MapSelector from './map-selector';

const MapSelectorView = React.createClass({
  propTypes: {
    lon: React.PropTypes.number.isRequired,
    lat: React.PropTypes.number.isRequired,
    zoom: React.PropTypes.number.isRequired,
    updateZoom: React.PropTypes.func.isRequired,
    updateLocation: React.PropTypes.func.isRequired
  },

  componentDidMount: function () {
    this.mapSelector = new MapSelector({el: 'svg',
      lon: this.props.lon,
      lat: this.props.lat,
      zoom: this.props.zoom,
      updateLocation: this.props.updateLocation,
      updateZoom: this.props.updateZoom});

    this.mapSelector.initMap();
  },

  componentWillReceiveProps: function (nextProps) {
    if (nextProps.lon !== this.props.lon || nextProps.lat !== this.props.lat) {
      this.mapSelector.lon = nextProps.lon;
      this.mapSelector.lat = nextProps.lat;
      this.mapSelector.updateRegionTiles();
    }
  },

  render: function () {
    return <div className='map-selector'><svg/></div>;
  },

  updateMapTiles: function () {

  }
});

export default MapSelectorView;
