const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const srcDir = path.join(__dirname, '../src')

const HASH = process.env.RELEASE ? process.env.RELEASE : '[contenthash]'
const __PRODUCTION__ = process.env.NODE_ENV === 'production'
const cssLoaderOptions = {
    sourceMap: true,
    localIdentName: __PRODUCTION__
        ? '[hash:base64]'
        : '[name]--[local]--[hash:base64:5]',
}
const styleBundleFile = __PRODUCTION__
    ? `helpdesk.app.${HASH}.css`
    : '[name].css'

module.exports = {
    stories: [`${srcDir}/**/*.stories.@(js|jsx|ts|tsx|mdx)`],
    addons: [
        '@storybook/addon-docs',
        '@storybook/addon-links',
        '@storybook/addon-controls',
        '@storybook/addon-essentials',
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
    core: {
        builder: 'webpack5',
    },
    webpackFinal: async (config) => {
        config.module.rules.push({
            test: /\.css$/i,
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

        return config
    },
}
