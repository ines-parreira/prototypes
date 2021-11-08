const webpack = require('webpack')
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')

const __PRODUCTION__ = process.env.NODE_ENV === 'production'
const HASH = process.env.RELEASE ? process.env.RELEASE : '[hash]'

const srcDir = path.join(__dirname, 'g/static/private')
const buildDir = path.join(__dirname, 'g/static/public/web-app')

const optimization = {
    minimizer: [
        new TerserPlugin({
            cache: true,
            parallel: true,
            sourceMap: true,
        }),
    ],
}

module.exports = () => {
    return {
        mode: __PRODUCTION__ ? 'production' : 'development',
        optimization,
        devtool: 'source-map',
        entry: {
            sharedWorker: `${srcDir}/js/services/socketManager/sharedWorker.js`,
        },
        output: {
            path: buildDir,
            filename: __PRODUCTION__ ? `helpdesk.shared-worker.${HASH}.js` : 'helpdesk.shared-worker.js',
        },
        module: {
            rules: [
                {
                    test: /\.js$/i,
                    loader: 'babel-loader?cacheDirectory',
                },
            ],
        },
        plugins: [
            new ManifestPlugin({
                seed: require(`${buildDir}/manifest.json`),
            }),
            new webpack.ProvidePlugin({
                Tether: 'tether',
            }),
        ],
    }
}
