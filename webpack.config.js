/* eslint  "env/es6": 0, "no-var": 0, "semi": 0 */

var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var __PRODUCTION__ = process.env.NODE_ENV === 'production'
var HASH = process.env.CIRCLE_SHA1 ? process.env.CIRCLE_SHA1 : '[hash]'

var staticDirectory = './g/static/private/'

var jsMainFile = staticDirectory + 'js/main.js'
var buildDir = staticDirectory + '_build/'
var jsBundleFile = __PRODUCTION__ ? (HASH + '.build.min.js') : 'build.js'
var jsBundleFileSourceMap = __PRODUCTION__ ? (HASH + '.build.min.js.map') : 'build.js.map'
var styleBundleFile = __PRODUCTION__ ? (HASH + '.build.min.css') : 'build.css'

var plugins = [
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /fr/),
    new ExtractTextPlugin(styleBundleFile, {
        allChunks: true
    })
]

if (__PRODUCTION__) {
    plugins.push(new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify('production')
        }
    }))
}

module.exports = {
    devtool: __PRODUCTION__ ? 'cheap-module-source-map' : 'cheap-eval-source-map',
    entry: jsMainFile,
    output: {
        path: buildDir,
        filename: jsBundleFile,
        sourceMapFilename: jsBundleFileSourceMap
    },
    plugins: plugins,
    module: {
        loaders: [
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loader: 'file-loader'
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader')
            },
            {
                test: /plugin\.css$/,
                loaders: [
                    'style', 'css'
                ]
            }
        ]
    }
}
