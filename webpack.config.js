const webpack = require('webpack')
const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const pkg = require('./package.json')

const __PRODUCTION__ = process.env.NODE_ENV === 'production'
const HASH = process.env.GIT_COMMIT ? process.env.GIT_COMMIT : '[hash]'

const srcDir = path.join(__dirname, 'g/static/private')
const jsBundleFile = __PRODUCTION__ ? `${HASH}.build.min.js` : 'build.js'
const styleBundleFile = __PRODUCTION__ ? `${HASH}.build.min.css` : 'build.css'

let plugins = [
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /fr/),
    new ExtractTextPlugin({
        filename: styleBundleFile,
        allChunks: true
    }),
    new webpack.optimize.CommonsChunkPlugin({
        name: 'vendors',
        filename: __PRODUCTION__ ? '[hash].[name].min.js' : '[name].js',
        minChunks: 2
    }),
    new ManifestPlugin(),
    new webpack.ProvidePlugin({
        Tether: 'tether',
    }),
    // escodegen throws a warning
    new webpack.ContextReplacementPlugin(/escodegen/, /^$/)
]

const devServer = {
    host: '0.0.0.0',
}

if (!__PRODUCTION__) {
    // disable host check for dev env (if using proxy)
    devServer.disableHostCheck = true
}

const cssOnlyPackages = ['semantic-ui', 'bootstrap', 'font-awesome']
const vendors = Object.keys(pkg.dependencies).filter(m => !cssOnlyPackages.includes(m))

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
    devServer,
    plugins,
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
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
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
            },
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader',
                        'less-loader'
                    ]
                })
            },
            // custom fonts
            {
                test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                loader: 'url-loader'
            },
            // audio
            {
                test: /\.mp3$/,
                loader: 'url-loader'
            }
        ]
    }
}
