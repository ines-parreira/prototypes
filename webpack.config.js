/* eslint  "env/es6": 0, "no-var": 0, "semi": 0 */

var webpack = require('webpack')
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var __PRODUCTION__ = process.env.NODE_ENV === 'production'
var HASH = process.env.GIT_COMMIT ? process.env.GIT_COMMIT : '[hash]'

var staticDirectory = './g/static/private/'

var jsMainFile = staticDirectory + 'js/main.js'
var buildDir = staticDirectory + '_build/'
var jsBundleFile = __PRODUCTION__ ? (HASH + '.build.min.js') : 'build.js'
var styleBundleFile = __PRODUCTION__ ? (HASH + '.build.min.css') : 'build.css'

var plugins = [
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /fr/),
    new ExtractTextPlugin(styleBundleFile, {
        allChunks: true
    })
]

if (__PRODUCTION__) {
    plugins = plugins.concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true, // React doesn't support IE8
                warnings: false
            },
            mangle: {
                screw_ie8: true
            },
            output: {
                comments: false,
                screw_ie8: true
            }
        })
    ])
}

module.exports = {
    devtool: __PRODUCTION__ ? 'source-map' : 'eval',
    entry: jsMainFile,
    output: {
        path: buildDir,
        filename: jsBundleFile
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
                test: /\.(jpe?g|png|gif)$/i,
                loader: 'file-loader'
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader')
            },
            {
                test: /\.css$/,
                loaders: [
                    'style', 'css'
                ]
            },
            // custom fonts
            {
                test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                loader: 'file-loader'
            }
        ]
    }
}
