const path = require('path')

const _ = require('lodash')

const outputPath = path.join(process.cwd(), 'src/assets/css/new/')

const tokenTypes = {
    colors: 'colors',
    typography: 'typography',
}

const StyleDictionary = require('style-dictionary').extend({
    source: [`${path.join(process.cwd(), 'src/assets/tokens')}/**/*.json`],
    platforms: {
        less: {
            transformGroup: 'less',
            buildPath: outputPath,
            files: [
                {
                    destination: 'colorTokens.less',
                    format: 'less/variables',
                    filter: (token) => {
                        return (
                            path.parse(token.filePath).name ===
                            tokenTypes.colors
                        )
                    },
                },
                {
                    destination: 'typographyTokens.less',
                    format: 'less/variables',
                    filter: (token) => {
                        return (
                            path.parse(token.filePath).name ===
                            tokenTypes.typography
                        )
                    },
                },
            ],
        },
    },
})

StyleDictionary.registerTransform({
    name: 'name/cti/kebab',
    type: 'name',
    transformer: (prop) => {
        const tokenType = path.parse(prop.filePath).name

        if (tokenType === tokenTypes.typography) {
            return _.kebabCase(
                escapeEmoji(
                    prop.attributes.subitem === prop.name
                        ? `${prop.attributes.type}-${prop.attributes.item}-${prop.attributes.subitem}`
                        : `${prop.attributes.type}-${prop.attributes.item}-${prop.attributes.subitem}-${prop.name}`
                )
            )
        }

        return _.kebabCase(
            escapeEmoji(
                `${prop.attributes.category}-${prop.attributes.type}-${prop.name}`
            )
        )
    },
})

StyleDictionary.buildAllPlatforms()

function escapeEmoji(value) {
    return value.replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, '')
}
