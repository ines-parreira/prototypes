/* eslint  "env/es6": 0, "no-var": 0, "semi": 0 */

var path = require('path')
var webpack = require('webpack')

var __PRODUCTION__ = process.env.NODE_ENV === 'production'

var staticDirectory = './g/static/private/'

var jsMainFile = staticDirectory + 'js/main.js'
var jsBuildPath = staticDirectory + '_build/js'
var jsBundleFile = __PRODUCTION__ ? '[hash].build.min.js' : 'build.js'

var plugins = [
    new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/])
]

if (__PRODUCTION__) {
    plugins.push(new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify('production')
        }
    }))
}

module.exports = {
    devtool: 'eval',
    entry: jsMainFile,
    output: {path: jsBuildPath, filename: jsBundleFile},
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
