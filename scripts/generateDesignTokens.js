const path = require('path')
const StyleDictionaryPackage = require('style-dictionary')
const _ = require('lodash')
const tinycolor = require('tinycolor2')

const outputPath = path.join(process.cwd(), 'src/assets/css/new/')

const tokenTypes = {
    colors: 'colors',
    typography: 'typography',
    layout: 'layout',
}

const header =
    `// Do not edit directly\n// Generated on ` +
    new Date().toUTCString() +
    `\n\n`

const formatter = (dictionary) => {
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

    return props
}

StyleDictionaryPackage.registerFormat({
    name: 'less/colors',
    formatter: function ({dictionary}) {
        const props = formatter(dictionary)
        return (
            header +
            Object.entries(props)
                .map(([theme, prop]) => {
                    const className =
                        theme === 'classic' ? ':root' : `.${theme}`

                    const customProps = Object.entries(prop).map(
                        ([name, value]) =>
                            `--${name}: ${value.hex};
                            --${name}-h: ${value.h};
                            --${name}-s: ${value.s}%;
                            --${name}-l: ${value.l}%;\n`
                    )

                    return `${className} {
                        ${customProps.join(';\n')};
                    }\n`
                })
                .join('\n')
        )
    },
})

StyleDictionaryPackage.registerFormat({
    name: 'less/variables/colors',
    formatter: function ({dictionary}) {
        const props = formatter(dictionary)
        return (
            header +
            Object.entries(props)
                .map(([theme, prop]) => {
                    return Object.entries(prop)
                        .map(
                            ([name, value]) =>
                                `@${theme}-${name}: ${value.hex};\n`
                        )
                        .join('')
                })
                .join('\n')
        )
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

StyleDictionaryPackage.registerTransform({
    name: 'color/hsl',
    type: 'value',
    matcher: function (token) {
        return path.parse(token.filePath).name === tokenTypes.colors
    },
    transformer: function (token) {
        const HSL = tinycolor(token.original.value).toHsl()

        return {
            hex: token.original.value,
            h: HSL.h,
            s: HSL.s * 100,
            l: HSL.l * 100,
        }
    },
})

const StyleDictionary = StyleDictionaryPackage.extend({
    source: [`${path.join(process.cwd(), 'src/assets/tokens')}/**/*.json`],
    platforms: {
        less: {
            transforms: [
                'attribute/cti',
                'name/cti/kebab',
                'color/hsl',
                'size/px',
            ],
            buildPath: outputPath,
            files: [
                {
                    destination: 'colorTokens.less',
                    format: 'less/variables/colors',
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
