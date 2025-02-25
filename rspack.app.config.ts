import { codecovWebpackPlugin } from '@codecov/webpack-plugin'
import { rspack, Configuration as RspackConfiguration } from '@rspack/core'
import ReactRefreshPlugin from '@rspack/plugin-react-refresh'
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'
import path from 'path'
import { RspackManifestPlugin } from 'rspack-manifest-plugin'
import { TsCheckerRspackPlugin } from 'ts-checker-rspack-plugin'

const {
    NODE_ENV,
    GORGIAS_ASSETS_URL,
    WEB_APP_RELEASE,
    DEV_ENV = 'local',
} = process.env

const isProd = NODE_ENV === 'production'
const isDev = !isProd

const BUNDLE_PUBLIC_PATH =
    DEV_ENV === 'proxy'
        ? 'https://acme.gorgias.docker:8080/'
        : 'http://acme.gorgias.docker:8080/'

const srcDir = path.join(__dirname, 'src')
const buildDir = path.join(__dirname, 'build')
const jsBundleFile = isProd
    ? `helpdesk.app.[contenthash].js`
    : 'helpdesk.app.js'
const styleBundleFile = isProd
    ? `helpdesk.app.[contenthash].css`
    : 'helpdesk.app.css'
const fontsBundleFile = 'font.css'

const mode = isProd ? 'production' : 'development'
const devtool = isProd ? 'source-map' : 'cheap-module-source-map'

const devServer: RspackConfiguration['devServer'] = {
    static: [
        { directory: buildDir },
        {
            directory: path.join(__dirname, 'src', 'assets'),
            publicPath: '/assets',
        },
    ],
    client: {
        logging: 'info',
        overlay: false,
        webSocketURL:
            DEV_ENV === 'proxy'
                ? 'wss://acme.gorgias.docker:8080/ws'
                : 'ws://0.0.0.0:8080/ws',
    },
    host: '0.0.0.0',
    server: DEV_ENV === 'proxy' ? 'https' : 'http',
    port: 8080,
    /**
     * Disable host check for dev env (if using proxy).
     * When set to 'all' this option bypasses host checking.
     * THIS IS NOT RECOMMENDED as apps that do not check the host are vulnerable to DNS rebinding attacks.
     */
    allowedHosts: isDev ? 'all' : 'auto',
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
    devMiddleware: {
        stats: 'minimal',
        publicPath: BUNDLE_PUBLIC_PATH,
    },
}
const optimization = {
    minimizer: [
        new rspack.SwcJsMinimizerRspackPlugin(),
        new rspack.LightningCssMinimizerRspackPlugin(),
    ],
}
const cssLoaderOptions = {
    sourceMap: true,
    modules: {
        mode: 'global',
        localIdentName: '[name]--[local]--[hash:base64:5]',
    },
}

let urlLoaderName = '[path][name].[ext]'
if (GORGIAS_ASSETS_URL) {
    const url = new URL(GORGIAS_ASSETS_URL)
    url.pathname = path.join(url.pathname, urlLoaderName)
    urlLoaderName = url.toString()
}
const urlLoader = {
    loader: 'url-loader',
    options: {
        limit: 5000,
        fallback: 'file-loader',
        emitFile: false,
        name: urlLoaderName,
        context: 'src/',
    },
}
const imageExtRegex = /\.(jpe?g|png|gif)$/i
const fontExtRegex = /\.(ttf|eot|svg|woff(2)?)$/i

export default {
    mode,
    devServer,
    devtool,
    optimization,
    entry: {
        build: `${srcDir}/main/init`,
        ...(isProd && { font: `${srcDir}/assets/css/font.less` }),
    },
    output: {
        publicPath: isProd ? '' : BUNDLE_PUBLIC_PATH,
        path: buildDir,
        filename: jsBundleFile,
    },
    resolve: {
        alias: {
            css: `${srcDir}/assets/css/`,
        },
        extensions: ['.ts', '.tsx', '.js'],
        modules: ['node_modules', srcDir],
    },
    plugins: [
        new rspack.ProvidePlugin({
            Tether: 'tether',
            process: 'process/browser.js',
        }),
        new NodePolyfillPlugin(),
        new rspack.CssExtractRspackPlugin({
            filename: ({ chunk }) => {
                return chunk?.name === 'font'
                    ? fontsBundleFile
                    : styleBundleFile
            },
        }),
        new rspack.DefinePlugin({
            'process.env.GORGIAS_ASSETS_URL': JSON.stringify(
                GORGIAS_ASSETS_URL || 'http://localhost:8080/',
            ),
            'process.env.WEB_APP_RELEASE': JSON.stringify(WEB_APP_RELEASE),
        }),
        isProd &&
            new RspackManifestPlugin({
                seed: require(`${buildDir}/manifest.json`),
            }),
        isDev && new ReactRefreshPlugin(),
        isDev && new rspack.HotModuleReplacementPlugin(),
        codecovWebpackPlugin({
            enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
            bundleName: 'helpdesk-web-app',
            uploadToken: process.env.CODECOV_TOKEN,
        }),
        new rspack.BannerPlugin(
            'WEB_APP_RELEASE: ' + WEB_APP_RELEASE || 'undefined',
        ),
        new TsCheckerRspackPlugin(),
    ].filter(Boolean),
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
                                transform: {
                                    react: {
                                        development: isDev,
                                        refresh: isDev,
                                    },
                                },
                            },
                        },
                    },
                ],
            },
            {
                test: /\.css$/i,
                use: [rspack.CssExtractRspackPlugin.loader, 'css-loader'],
                type: 'javascript/auto',
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: rspack.CssExtractRspackPlugin.loader,
                    },
                    {
                        loader: 'css-loader',
                        options: cssLoaderOptions,
                    },
                    {
                        loader: 'less-loader',
                        options: cssLoaderOptions,
                    },
                ],
            },
            {
                test: imageExtRegex,
                exclude: /node_modules/,
                type: 'javascript/auto',
                use: [urlLoader],
            },
            // custom fonts
            {
                test: fontExtRegex,
                exclude: /node_modules/,
                type: 'javascript/auto',
                use: [urlLoader],
            },
            // audio and video
            {
                test: /\.(mp[34])$/i,
                type: 'javascript/auto',
                use: [urlLoader],
            },
            // embed node_modules assets
            {
                test: {
                    or: [imageExtRegex, fontExtRegex],
                },
                include: /node_modules/,
                type: 'javascript/auto',
                use: [{ loader: 'url-loader' }],
            },
        ],
    },
} satisfies RspackConfiguration
