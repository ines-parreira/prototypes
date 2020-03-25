const webpack = require('webpack')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')

const pkg = require('./package.json')

const __PRODUCTION__ = process.env.NODE_ENV === 'production'
const HASH = process.env.RELEASE ? process.env.RELEASE : '[hash]'
const GORGIAS_ASSETS_URL = __PRODUCTION__ ? 'https://gorgias-assets.gorgias.io' : ''
const BUNDLE_PUBLIC_PATH = 'http://acme.gorgias.docker:8080/'

const srcDir = path.join(__dirname, 'g/static/private')
const buildDir = path.join(srcDir, '_build')
const jsBundleFile = __PRODUCTION__ ? `${HASH}.build.min.js` : 'build.js'
const styleBundleFile = __PRODUCTION__ ? `${HASH}.build.min.css` : 'build.css'
const vendorsBundleFile = __PRODUCTION__ ? `${HASH}.vendors.min.js` : 'vendors.js'

const mode = __PRODUCTION__ ? 'production' : 'development'
const devtool = 'source-map'
const devServer = {
    contentBase: [
        buildDir,
        path.join(__dirname, 'g')
    ],
    host: '0.0.0.0',
    // disable host check for dev env (if using proxy)
    disableHostCheck: !__PRODUCTION__,
    headers: {
        'Access-Control-Allow-Origin': '*'
    }
}
const optimization = {
    minimizer: [
        new TerserPlugin({
            cache: true,
            parallel: true,
            sourceMap: true
        }),
        new OptimizeCSSAssetsPlugin({
            cssProcessorOptions: {
                map: {
                    inline: false
                }
            }
        })
    ]
}
const cssLoaderOptions = {
    sourceMap: true,
    localIdentName: __PRODUCTION__ ? '[hash:base64]' : '[name]--[local]--[hash:base64:5]'
}
const urlLoader = {
    loader: 'url-loader',
    options: {
        limit: 5000,
        fallback: 'file-loader',
        emitFile: false,
        name: `${GORGIAS_ASSETS_URL}/[path][name].[ext]`,
        context: 'g/'
    }
}
const imageExtRegex = /\.(jpe?g|png|gif)$/i
const fontExtRegex = /\.(ttf|eot|svg|woff(2)?)$/i

const cssOnlyPackages = ['bootstrap']
const vendors = Object.keys(pkg.dependencies).filter(m => !cssOnlyPackages.includes(m))

const outputOptions = __PRODUCTION__? {} : {publicPath: BUNDLE_PUBLIC_PATH}
const aliasOptions = __PRODUCTION__ ? {} : {'react-dom': '@hot-loader/react-dom'}

module.exports = (env = {}) => {
    if (env.dll) {
        return {
            mode,
            optimization,
            entry: {
                vendors,
            },
            output: {
                path: buildDir,
                filename: vendorsBundleFile,
                library: 'vendors',
            },
            plugins: [
                new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /fr/),
                new webpack.ContextReplacementPlugin(/escodegen/, /^$/),
                new webpack.DllPlugin({
                    name: '[name]',
                    path: path.join(buildDir, `[name].${mode}.manifest.json`),
                }),
                new ManifestPlugin(),
            ],
            module: {
                rules: [
                    {
                        test: /\.css$/,
                        use: [
                            'style-loader',
                            'css-loader'
                        ]
                    }
                ]
            }
        }
    }

    return {
        mode,
        optimization,
        devServer,
        devtool,
        node: {
            fs: 'empty'
        },
        entry: {
            build: `${srcDir}/js/main.js`,
        },
        output: {
            ...outputOptions,
            path: buildDir,
            filename: jsBundleFile,
        },
        module: {
            rules: [
                {
                    test: /\.js$/i,
                    exclude: /node_modules/,
                    loader: 'babel-loader?cacheDirectory'
                },
                {
                    test: /\.css$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: cssLoaderOptions
                        }
                    ]
                },
                {
                    test: /\.less$/i,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                hmr: !__PRODUCTION__,
                                reloadAll: false,
                            }
                        },
                        {
                            loader: 'css-loader',
                            options: cssLoaderOptions
                        },
                        {
                            loader: 'less-loader',
                            options: cssLoaderOptions
                        }
                    ]
                },
                {
                    test: imageExtRegex,
                    exclude: /node_modules/,
                    use: urlLoader
                },
                // custom fonts
                {
                    test: fontExtRegex,
                    exclude: /node_modules/,
                    loader: urlLoader
                },
                // audio
                {
                    test: /\.mp3$/i,
                    loader: urlLoader
                },
                // embed node_modules assets
                {
                    test: {
                        or: [
                            imageExtRegex,
                            fontExtRegex
                        ]
                    },
                    include: /node_modules/,
                    loader: 'url-loader'
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: styleBundleFile,
            }),
            new webpack.DllReferencePlugin({
                manifest: require(`${buildDir}/vendors.${mode}.manifest.json`)
            }),
            new ManifestPlugin({
                seed: require(`${buildDir}/manifest.json`)
            }),
            new webpack.ProvidePlugin({
                Tether: 'tether',
            }),
        ],
        resolve: {
            alias: {
                ...aliasOptions,
                css: `${srcDir}/css/`,
            }
        }
    }
}
