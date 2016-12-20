const webpack = require('webpack')
const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const pkg = require('./package.json')

const __PRODUCTION__ = process.env.NODE_ENV === 'production'
const HASH = process.env.GIT_COMMIT ? process.env.GIT_COMMIT : '[hash]'

const srcDir = './g/static/private'
const jsBundleFile = __PRODUCTION__ ? `${HASH}.build.min.js` : 'build.js'
const styleBundleFile = __PRODUCTION__ ? `${HASH}.build.min.css` : 'build.css'

let plugins = [
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /fr/),
    new ExtractTextPlugin(styleBundleFile, {
        allChunks: true
    }),
    new webpack.optimize.CommonsChunkPlugin({
        name: 'vendors',
        filename: __PRODUCTION__ ? '[hash].[name].min.js' : '[name].js',
        minChunks: 2
    }),
    new ManifestPlugin()
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

// compile a list of vendors from our package dependencies. Filter semantic because it's special..
const vendors = Object.keys(pkg.dependencies).filter(m => m !== 'semantic-ui')
module.exports = {
    devtool: __PRODUCTION__ ? 'source-map' : 'eval',
    entry: {
        build: `${srcDir}/js/main.js`,
        vendors,
    },
    output: {
        path: `${srcDir}/_build`,
        pathinfo: true,
        filename: jsBundleFile
    },
    noParse: vendors.map((name) => {
        return path.join(__dirname, 'node_modules', name)
    }),
    plugins,
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/
            },
            {
                test: /.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.(jpe?g|png|gif)$/i,
                loader: 'url-loader'
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
            },
            // audio
            {
                test: /\.mp3$/,
                loader: 'url-loader'
            }
        ]
    }
}
