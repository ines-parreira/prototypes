import path from 'path'

import {codecovWebpackPlugin} from '@codecov/webpack-plugin'
import {rspack, Configuration as RspackConfiguration} from '@rspack/core'
import {RspackManifestPlugin} from 'rspack-manifest-plugin'

const {NODE_ENV} = process.env

const isProd = NODE_ENV === 'production'

const buildDir = path.join(__dirname, 'build')

const mode = isProd ? 'production' : 'development'
const devtool = isProd ? 'source-map' : 'cheap-module-source-map'

// Only bundle one dependency for now since it's a dummy file output
const vendors = ['classnames']

const vendorsBundleFile = isProd
    ? `helpdesk.vendors.[contenthash].js`
    : 'helpdesk.vendors.js'

export default {
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
} satisfies RspackConfiguration
