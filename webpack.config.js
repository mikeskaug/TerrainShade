var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: { path: path.resolve(__dirname, "dist"),
            publicPath: "./dist/",
            filename: 'bundle.js' },

  resolve: {
    extensions: ['', '.js', '.jsx']
  },

  debug: true,
  devtool: 'source-map',

  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      } , {
        test: /\.less$/,
        loader: "style!css!less"
      }
    ]
  }

};
