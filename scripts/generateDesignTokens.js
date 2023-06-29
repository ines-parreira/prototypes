const path = require('path')
const StyleDictionaryPackage = require('style-dictionary')
const _ = require('lodash')

const outputPath = path.join(process.cwd(), 'src/assets/css/new/')

const tokenTypes = {
    colors: 'colors',
    typography: 'typography',
    layout: 'layout',
}

const template = (props) =>
    Object.entries(props).map(([theme, prop]) => {
        const className = theme === 'classic' ? ':root' : `.${theme}`

        const customProps = Object.entries(prop).map(([name, value]) => {
            return `--${name}: ${value}`
        })

        return `${className} {
        ${customProps.join(`;
        `)};
            }
        `
    }).join(`
        `)

StyleDictionaryPackage.registerFormat({
    name: 'less/colors',
    formatter: function ({dictionary}) {
        const header =
            `// Do not edit directly\n// Generated on ` +
            new Date().toUTCString() +
            `\n\n`
        const {allProperties} = dictionary
        const props = {}

        allProperties.forEach((prop) => {
            const {
                attributes: {category, type, item, subitem},
                value,
            } = prop

            const classname = _.kebabCase(escapeEmoji(category))

            if (!props.hasOwnProperty(classname)) {
                props[classname] = {}
            }

            props[classname][
                `${_.kebabCase(`${type}-${subitem ? subitem : item}`)}`
            ] = value
        })

        return header + template(props)
    },
})

StyleDictionaryPackage.registerTransform({
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

const StyleDictionary = StyleDictionaryPackage.extend({
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
                    destination: 'customProperties.less',
                    format: 'less/colors',
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
                {
                    destination: 'layout.less',
                    format: 'less/variables',
                    filter: (token) => {
                        return (
                            path.parse(token.filePath).name ===
                            tokenTypes.layout
                        )
                    },
                },
            ],
        },
    },
})

StyleDictionary.buildAllPlatforms()

function escapeEmoji(value) {
    return value.replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, '')
}
