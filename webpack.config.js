var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './src/app.js',
  output: { path: path.resolve(__dirname, "dist"),
            publicPath: "/dist/",
            filename: 'bundle.js' },

  debug: true,
  devtool: 'source-map',

  module: {
    loaders: [
      {
        test: /.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      }
    ]
  }

};
