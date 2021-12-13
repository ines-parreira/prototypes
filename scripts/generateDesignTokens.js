const path = require('path')

const _ = require('lodash')

const outputPath = path.join(
    process.cwd(),
    'g/static/private/js/assets/css/new/'
)

const StyleDictionary = require('style-dictionary').extend({
    source: [
        `${path.join(
            process.cwd(),
            'g/static/private/js/assets/tokens'
        )}/**/*.json`,
    ],
    platforms: {
        less: {
            transformGroup: 'less',
            buildPath: outputPath,
            files: [
                {
                    destination: 'colorTokens.less',
                    format: 'less/variables',
                },
            ],
        },
    },
})

StyleDictionary.registerTransform({
    name: 'name/cti/kebab',
    type: 'name',
    transformer: (prop) =>
        _.kebabCase(
            escapeEmoji(
                `${prop.attributes.category}-${prop.attributes.type}-${prop.name}`
            )
        ),
})
StyleDictionary.buildAllPlatforms()

function escapeEmoji(value) {
    return value.replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, '')
}
