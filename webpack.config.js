const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const SRC_DIR = path.join(__dirname, '/client/src');
const DIST_DIR = path.join(__dirname, '/client/dist');

module.exports = {
  entry: `${SRC_DIR}/App.jsx`,
  output: {
    path: DIST_DIR,
    filename: '[name].js',
    sourceMapFilename: '[name].js.map',
  },
  devtool: 'source-map',
  plugins: [
    new HtmlWebpackPlugin({
      favicon: './client/src/assets/favicon.ico',
      template: './client/src/assets/template.html',
      inject: 'body',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|webp)$/i,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
          },
        },
        {
          loader: 'webp-loader',
        },
        ],
      },
    ],
  },
};
