import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { codecovWebpackPlugin } from '@codecov/webpack-plugin'
import { rspack } from '@rspack/core'
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'
import { RspackManifestPlugin } from 'rspack-manifest-plugin'
import { merge } from 'webpack-merge'

const { DEV_ENV, NODE_ENV, NO_CONTENT_HASH, RELEASE } = process.env

const isProd = NODE_ENV === 'production'
const isDev = !isProd
const noContentHash = NO_CONTENT_HASH || isDev
const HASH = RELEASE ? RELEASE : noContentHash ? null : '[contenthash]'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BUNDLE_PUBLIC_PATH =
    DEV_ENV === 'proxy'
        ? 'https://acme.gorgias.docker:8080/'
        : 'http://acme.gorgias.docker:8080/'

const srcDir = path.join(__dirname, 'src')
const buildDir = path.join(__dirname, 'build')
const manifestPath = path.join(buildDir, 'manifest.json')
const optimization = {
    minimizer: [new rspack.SwcJsMinimizerRspackPlugin()],
}

const base = {
    mode: isProd ? 'production' : 'development',
    optimization,
    devtool: 'source-map',
    output: {
        path: buildDir,
        publicPath: isProd ? '' : BUNDLE_PUBLIC_PATH,
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
    ],
}

/** @type {import('@rspack/cli').Configuration} */
const sharedWorkerConfig = merge(base, {
    entry: {
        sharedWorker: `${srcDir}/services/socketManager/sharedWorker.ts`,
    },
    output: {
        filename: isProd
            ? ['helpdesk.shared-worker', HASH, 'js'].filter(Boolean).join('.')
            : 'helpdesk.shared-worker.js',
    },
    plugins: [
        codecovWebpackPlugin({
            enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
            bundleName: 'helpdesk-shared-worker',
            uploadToken: process.env.CODECOV_TOKEN,
        }),
    ],
})

const serviceWorkerConfig = merge(base, {
    entry: { serviceWorker: `${srcDir}/main/serviceWorker/index.ts` },
    output: {
        filename: isProd
            ? ['helpdesk.service-worker', HASH, 'js'].filter(Boolean).join('.')
            : 'helpdesk.service-worker.js',
    },
    plugins: [
        codecovWebpackPlugin({
            enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
            bundleName: 'helpdesk-service-worker',
            uploadToken: process.env.CODECOV_TOKEN,
        }),
    ],
})

const workerConfigs = [sharedWorkerConfig, serviceWorkerConfig]

export default workerConfigs
