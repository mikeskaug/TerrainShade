import React from 'react';
import ReactDOM from 'react-dom';

import TerrainShadeApp from './TerrainShadeApp';

require('./less/app.less');

ReactDOM.render(
  <TerrainShadeApp />,
  document.getElementById('app')
);
