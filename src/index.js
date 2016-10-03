import React from 'react';
import ReactDOM from 'react-dom';

import TerrainShadeApp from './TerrainShadeApp';

require('./less/app.less');

document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    ReactDOM.render(
      <TerrainShadeApp />,
      document.getElementById('app')
    );
  }
}
