const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')

const srcDir = path.join(__dirname, '../src')
const HASH = process.env.RELEASE ? process.env.RELEASE : '[contenthash]'
const __PRODUCTION__ = process.env.NODE_ENV === 'production'
const cssLoaderOptions = {
    sourceMap: true,
    modules: {
        mode: 'global',
        localIdentName: __PRODUCTION__
            ? '[hash:base64]'
            : '[name]--[local]--[hash:base64:5]',
    },
}
const styleBundleFile = __PRODUCTION__
    ? `helpdesk.app.${HASH}.css`
    : '[name].css'

module.exports = {
    stories: ['../src/**/*.mdx', `${srcDir}/**/*.stories.@(js|jsx|ts|tsx|mdx)`],
    staticDirs: [`${srcDir}`],
    addons: [
        '@storybook/addon-docs',
        '@storybook/addon-links',
        '@storybook/addon-controls',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
    ],
    babel: {
        presets: [
            [
                '@babel/env',
                {
                    targets: {
                        browsers: ['last 2 versions', 'safari >= 7'],
                    },
                    useBuiltIns: 'usage',
                    corejs: '3.36.0',
                    loose: true,
                },
            ],
            '@babel/react',
            [
                '@babel/typescript',
                {
                    allExtensions: true,
                    isTSX: true,
                },
            ],
        ],
        plugins: [
            [
                '@babel/plugin-proposal-decorators',
                {
                    legacy: true,
                },
            ],
            '@babel/plugin-proposal-optional-chaining',
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-export-default-from',
        ],
    },
    typescript: {
        check: false,
        reactDocgen: 'react-docgen-typescript',
        reactDocgenTypescriptOptions: {
            shouldExtractLiteralValuesFromEnum: true,
            shouldRemoveUndefinedFromOptional: true,
        },
    },
    webpackFinal: async (config) => {
        const {global, ...alias} = config.resolve.alias
        config.resolve.alias = alias
        config.module.rules.push({
            test: /\.css$/i,
            exclude: /node_modules/,
            use: [
                MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader',
                    options: cssLoaderOptions,
                },
            ],
        })
        config.module.rules.push({
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
        })

        config.resolve = {
            ...config.resolve,
            alias: {
                ...config.resolve.alias,
                css: `${srcDir}/assets/css/`,
                'launchdarkly-react-client-sdk': require.resolve('./launchdarkly-js-client-sdk.tsx'),
            },
            extensions: ['.ts', '.tsx', '.js'],
            modules: ['node_modules', srcDir],
            fallback: {
                https: require.resolve('https-browserify'),
                http: require.resolve('stream-http'),
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve('stream-browserify'),
                path: require.resolve('path-browserify'),
            },
        }

        config.plugins.push(
            new MiniCssExtractPlugin({
                filename: styleBundleFile,
            })
        )
        config.plugins.push(
            new webpack.ProvidePlugin({
                process: require.resolve('process/browser.js'),
            })
        )

        return config
    },
    framework: {
        name: '@storybook/react-webpack5',
        options: {},
    },
    docs: {
        autodocs: true,
    },
}
