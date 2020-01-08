/* eslint-env node */

const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const { version } = require('./package.json')

const serverPublic = path.join(__dirname, 'server', 'public')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: serverPublic,
    filename: 'bundle.js',
  },
  plugins: [
    new CopyWebpackPlugin([
      { context: './src', from: '*.html' },
      { context: './src', from: 'stream-processor.js' },
      { context: './src', from: '*.css' },
      { context: './src', from: '*.ttf' }
    ]),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      version
    })
  ],
  devtool: 'source-map',
  devServer: {
    contentBase: serverPublic
  }
}
