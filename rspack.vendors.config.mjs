import { codecovWebpackPlugin } from '@codecov/webpack-plugin'
import { rspack } from '@rspack/core'
import path from 'path'
import { RspackManifestPlugin } from 'rspack-manifest-plugin'
import { fileURLToPath } from 'url'

const { NODE_ENV } = process.env

const isProd = NODE_ENV === 'production'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const buildDir = path.join(__dirname, 'build')

const mode = isProd ? 'production' : 'development'
const devtool = isProd ? 'source-map' : 'cheap-module-source-map'

// Only bundle one dependency for now since it's a dummy file output
const vendors = ['classnames']

const vendorsBundleFile = isProd
    ? `helpdesk.vendors.[contenthash].js`
    : 'helpdesk.vendors.js'

/** @type {import('@rspack/cli').Configuration} */
const config = {
    mode,
    devtool,
    entry: {
        vendors,
    },
    output: {
        path: buildDir,
        publicPath: '',
        filename: vendorsBundleFile,
        library: 'vendors',
    },
    resolve: {},
    plugins: [
        new rspack.DllPlugin({
            name: '[name]',
            path: path.join(buildDir, `[name].${mode}.manifest.json`),
        }),
        new RspackManifestPlugin({}),
        codecovWebpackPlugin({
            enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
            bundleName: 'helpdesk-web-app-vendor',
            uploadToken: process.env.CODECOV_TOKEN,
        }),
    ],
}

export default config
