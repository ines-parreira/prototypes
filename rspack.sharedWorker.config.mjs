import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { codecovWebpackPlugin } from '@codecov/webpack-plugin'
import { rspack } from '@rspack/core'
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'
import { RspackManifestPlugin } from 'rspack-manifest-plugin'

const { NODE_ENV, NO_CONTENT_HASH, RELEASE } = process.env

const isProd = NODE_ENV === 'production'
const isDev = !isProd
const noContentHash = NO_CONTENT_HASH || isDev
const HASH = RELEASE ? RELEASE : noContentHash ? null : '[contenthash]'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const srcDir = path.join(__dirname, 'src')
const buildDir = path.join(__dirname, 'build')
const manifestPath = path.join(buildDir, 'manifest.json')
const optimization = {
    minimizer: [new rspack.SwcJsMinimizerRspackPlugin()],
}

/** @type {import('@rspack/cli').Configuration} */
const config = {
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
            ? ['helpdesk.shared-worker', HASH, 'js'].filter(Boolean).join('.')
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
                seed: JSON.parse(fs.readFileSync(manifestPath, 'utf8')),
            }),
        codecovWebpackPlugin({
            enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
            bundleName: 'helpdesk-shared-worker',
            uploadToken: process.env.CODECOV_TOKEN,
        }),
    ],
}

export default config
