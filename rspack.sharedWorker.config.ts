import { codecovWebpackPlugin } from '@codecov/webpack-plugin'
import { rspack, Configuration as RspackConfiguration } from '@rspack/core'
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'
import path from 'path'
import { RspackManifestPlugin } from 'rspack-manifest-plugin'

const isProd = process.env.NODE_ENV === 'production'
const HASH = process.env.RELEASE ? process.env.RELEASE : '[contenthash]'

const srcDir = path.join(__dirname, 'src')
const buildDir = path.join(__dirname, 'build')

const optimization = {
    minimizer: [new rspack.SwcJsMinimizerRspackPlugin()],
}

export default {
    mode: isProd ? 'production' : 'development',
    optimization,
    devtool: 'source-map',
    entry: {
        sharedWorker: `${srcDir}/services/socketManager/sharedWorker.ts`,
    },
    output: {
        path: buildDir,
        publicPath: '',
        filename: isProd
            ? `helpdesk.shared-worker.${HASH}.js`
            : 'helpdesk.shared-worker.js',
    },
    module: {
        rules: [
            {
                test: /\.(js|tsx?)$/i,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'builtin:swc-loader',
                        options: {
                            sourceMap: true,
                            jsc: {
                                parser: {
                                    syntax: 'typescript',
                                    tsx: true,
                                },
                            },
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    plugins: [
        new rspack.ProvidePlugin({
            Tether: 'tether',
            process: 'process/browser.js',
        }),
        new NodePolyfillPlugin(),
        isProd &&
            new RspackManifestPlugin({
                seed: require(`${buildDir}/manifest.json`),
            }),
        codecovWebpackPlugin({
            enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
            bundleName: 'helpdesk-shared-worker',
            uploadToken: process.env.CODECOV_TOKEN,
        }),
    ],
} satisfies RspackConfiguration
