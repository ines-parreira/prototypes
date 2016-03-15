var path = require('path')
var webpack = require('webpack')

var __PRODUCTION__ = process.env.NODE_ENV === 'production'

var staticDirectory = './g/static/private/'

var jsMainFile = staticDirectory + 'js/main.js'
var jsBuildPath = staticDirectory + '_build/js'
var jsBundleFile = __PRODUCTION__ ? 'build.min.js' : 'build.js'


var prodEnvPlugin = new webpack.DefinePlugin({
  __PRODUCTION__: JSON.stringify(__PRODUCTION__),
})


module.exports = {
  devtool: 'eval',
  entry: jsMainFile,
  output: { path: jsBuildPath, filename: jsBundleFile },
  plugins: [prodEnvPlugin],
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.less$/,
        loader: "style!css!less"
      },
    ]
  },
}
