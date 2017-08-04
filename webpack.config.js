const webpack = require('webpack')
const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')

const pkg = require('./package.json')

const __PRODUCTION__ = process.env.NODE_ENV === 'production'
const HASH = process.env.GIT_COMMIT ? process.env.GIT_COMMIT : '[hash]'

const srcDir = path.join(__dirname, 'g/static/private')
const buildDir = path.join(srcDir, '_build')
const jsBundleFile = __PRODUCTION__ ? `${HASH}.build.min.js` : 'build.js'
const styleBundleFile = __PRODUCTION__ ? `${HASH}.build.min.css` : 'build.css'
const vendorsBundleFile = __PRODUCTION__ ? `${HASH}.vendors.min.js` : 'vendors.js'

const pathinfo = !__PRODUCTION__
const devtool = __PRODUCTION__ ? 'source-map' : 'eval'
const devServer = {
    contentBase: buildDir,
    host: '0.0.0.0',
    // disable host check for dev env (if using proxy)
    disableHostCheck: !__PRODUCTION__
}

const cssOnlyPackages = ['bootstrap', 'font-awesome']
const vendors = Object.keys(pkg.dependencies).filter(m => !cssOnlyPackages.includes(m))

module.exports = (env = {}) => {
    if (env.dll) {
        return {
            devtool,
            entry: {
                vendors,
            },
            output: {
                path: buildDir,
                pathinfo,
                filename: vendorsBundleFile,
                library: 'vendors',
            },
            plugins: [
                new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /fr/),
                new webpack.ContextReplacementPlugin(/escodegen/, /^$/),
                new webpack.DllPlugin({
                    name: '[name]',
                    path: path.join(buildDir, '[name].manifest.json'),
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
        devtool,
        devServer,
        entry: {
            build: `${srcDir}/js/main.js`,
        },
        output: {
            path: buildDir,
            pathinfo,
            filename: jsBundleFile
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader?cacheDirectory'
                },
                {
                    test: /.json$/,
                    loader: 'json-loader'
                },
                {
                    test: /\.(jpe?g|png|gif)$/i,
                    loader: 'url-loader'
                },
                {
                    test: /\.css$/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: 'css-loader'
                    })
                },
                {
                    test: /\.less$/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
                            'css-loader',
                            'less-loader'
                        ]
                    })
                },
                // custom fonts
                {
                    test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                    loader: 'url-loader'
                },
                // audio
                {
                    test: /\.mp3$/,
                    loader: 'url-loader'
                }
            ]
        },
        plugins: [
            new ExtractTextPlugin({
                filename: styleBundleFile,
                allChunks: true
            }),
            new webpack.DllReferencePlugin({
                manifest: require(`${buildDir}/vendors.manifest.json`)
            }),
            new ManifestPlugin({
                cache: require(`${buildDir}/manifest.json`)
            }),
            new webpack.ProvidePlugin({
                Tether: 'tether',
            }),
        ]
    }
}
