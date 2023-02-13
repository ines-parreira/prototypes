const path = require('path')

const webpack = require('webpack')

const TerserPlugin = require('terser-webpack-plugin')
const {WebpackManifestPlugin} = require('webpack-manifest-plugin')

const __PRODUCTION__ = process.env.NODE_ENV === 'production'
const HASH = process.env.RELEASE ? process.env.RELEASE : '[contenthash]'

const srcDir = path.join(__dirname, 'src')
const buildDir = path.join(__dirname, 'build')

const optimization = {
    minimizer: [
        new TerserPlugin({
            parallel: true,
            terserOptions: {
                nameCache: {},
                sourceMap: true,
            },
        }),
    ],
}

module.exports = () => {
    return {
        mode: __PRODUCTION__ ? 'production' : 'development',
        optimization,
        devtool: 'source-map',
        entry: {
            sharedWorker: `${srcDir}/services/socketManager/sharedWorker.ts`,
        },
        output: {
            path: buildDir,
            publicPath: '',
            filename: __PRODUCTION__
                ? `helpdesk.shared-worker.${HASH}.js`
                : 'helpdesk.shared-worker.js',
        },
        module: {
            rules: [
                {
                    test: /\.(js|tsx?)$/i,
                    use: [{loader: 'babel-loader?cacheDirectory'}],
                },
            ],
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js'],
        },
        plugins: [
            new WebpackManifestPlugin({
                seed: require(`${buildDir}/manifest.json`),
            }),
            new webpack.ProvidePlugin({
                Tether: 'tether',
            }),
        ],
    }
}
