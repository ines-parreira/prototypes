/* eslint  "env/es6": 0, "no-var": 0, "semi": 0 */

var path = require('path')
var webpack = require('webpack')

var __PRODUCTION__ = process.env.NODE_ENV === 'production'
var HASH = process.env.CIRCLE_SHA1 ? process.env.CIRCLE_SHA1 : '[hash]'

var staticDirectory = './g/static/private/'

var jsMainFile = staticDirectory + 'js/main.js'
var jsBuildPath = staticDirectory + '_build/js'
var jsBundleFile = __PRODUCTION__ ? (HASH + '.build.min.js') : 'build.js'
var jsBundleFileSourceMap = __PRODUCTION__ ? (HASH + '.build.min.js.map') : 'build.js.map'

var plugins = [
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /fr/)
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
        path: jsBuildPath,
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
                test: /\.less$/,
                loader: 'style!css!less'
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
