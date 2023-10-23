const path = require('path')

const webpack = require('webpack')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const {WebpackManifestPlugin} = require('webpack-manifest-plugin')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

const pkg = require('./package.json')

const {NODE_ENV, RELEASE, GORGIAS_ASSETS_URL} = process.env

const __PRODUCTION__ = NODE_ENV === 'production'
const HASH = RELEASE || '[contenthash]'

const BUNDLE_PUBLIC_PATH = 'http://acme.gorgias.docker:8080/'

const srcDir = path.join(__dirname, 'src')
const buildDir = path.join(__dirname, 'build')
const jsBundleFile = __PRODUCTION__
    ? `helpdesk.app.${HASH}.js`
    : 'helpdesk.app.js'
const styleBundleFile = __PRODUCTION__
    ? `helpdesk.app.${HASH}.css`
    : 'helpdesk.app.css'
const vendorsBundleFile = __PRODUCTION__
    ? `helpdesk.vendors.${HASH}.js`
    : 'helpdesk.vendors.js'

const mode = __PRODUCTION__ ? 'production' : 'development'
const devtool = __PRODUCTION__ ? 'source-map' : 'cheap-module-source-map'
const devServer = {
    static: [
        {directory: buildDir},
        {
            directory: path.join(__dirname, 'src', 'assets'),
            publicPath: '/assets',
        },
    ],
    client: {
        logging: 'info',
        webSocketURL: 'ws://0.0.0.0:8080/ws',
    },
    host: '0.0.0.0',
    /**
     * Disable host check for dev env (if using proxy).
     * When set to 'all' this option bypasses host checking.
     * THIS IS NOT RECOMMENDED as apps that do not check the host are vulnerable to DNS rebinding attacks.
     */
    allowedHosts: !__PRODUCTION__ ? 'all' : 'auto',
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
    devMiddleware: {
        stats: 'minimal',
    },
}
const optimization = {
    minimizer: [
        new TerserPlugin({
            parallel: true,
            terserOptions: {
                nameCache: {},
                sourceMap: true,
            },
        }),
        new CssMinimizerPlugin({
            minimizerOptions: {
                processorOptions: {
                    map: {
                        inline: false,
                    },
                },
            },
        }),
    ],
}
const cssLoaderOptions = {
    sourceMap: true,
    localIdentName: __PRODUCTION__
        ? '[hash:base64]'
        : '[name]--[local]--[hash:base64:5]',
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

const cssOnlyPackages = ['bootstrap']
const vendors = Object.keys(pkg.dependencies).filter(
    (m) => !cssOnlyPackages.includes(m)
)

const outputOptions = __PRODUCTION__
    ? {publicPath: ''}
    : {publicPath: BUNDLE_PUBLIC_PATH}
const aliasOptions = __PRODUCTION__
    ? {}
    : {'react-dom': '@hot-loader/react-dom'}

module.exports = (env = {}) => {
    if (env.dll) {
        return {
            mode,
            optimization,
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
            plugins: [
                new webpack.ContextReplacementPlugin(
                    /moment[\/\\]locale$/,
                    /fr/
                ),
                new webpack.ContextReplacementPlugin(/escodegen/, /^$/),
                new webpack.DllPlugin({
                    name: '[name]',
                    path: path.join(buildDir, `[name].${mode}.manifest.json`),
                }),
                new WebpackManifestPlugin(),
                new NodePolyfillPlugin(),
            ],
            module: {
                rules: [
                    {
                        test: /\.css$/,
                        use: ['style-loader', 'css-loader'],
                    },
                ],
            },
        }
    }

    return {
        mode,
        optimization,
        devServer,
        devtool,
        entry: {
            build: `${srcDir}/core/init`,
        },
        output: {
            ...outputOptions,
            path: buildDir,
            filename: jsBundleFile,
        },
        module: {
            rules: [
                {
                    test: /\.(js|tsx?)$/i,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader?cacheDirectory',
                            options: {
                                plugins: [
                                    !__PRODUCTION__ &&
                                        require.resolve('react-refresh/babel'),
                                ].filter(Boolean),
                            },
                        },
                    ],
                },
                {
                    test: /\.css$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: cssLoaderOptions,
                        },
                    ],
                },
                {
                    test: /\.less$/i,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
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
                // audio
                {
                    test: /\.mp3$/i,
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
                    use: [{loader: 'url-loader'}],
                },
            ],
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: styleBundleFile,
            }),
            new webpack.DllReferencePlugin({
                manifest: require(`${buildDir}/vendors.${mode}.manifest.json`),
            }),
            new WebpackManifestPlugin({
                seed: require(`${buildDir}/manifest.json`),
            }),
            new webpack.ProvidePlugin({
                Tether: 'tether',
            }),
            new webpack.EnvironmentPlugin({
                GORGIAS_ASSETS_URL: 'http://localhost:8080/',
            }),
            new NodePolyfillPlugin(),
            !__PRODUCTION__ && new ReactRefreshWebpackPlugin(),
        ].filter(Boolean),
        resolve: {
            alias: {
                ...aliasOptions,
                css: `${srcDir}/assets/css/`,
            },
            extensions: ['.ts', '.tsx', '.js'],
            modules: ['node_modules', srcDir],
        },
    }
}
