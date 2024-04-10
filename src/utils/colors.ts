import {lighten, getContrast, toRgba} from 'color2k'

const DEFAULT_CONTRAST_LEVEL = 4

// It is meant to work with a dark backgroundColor
export function getEnoughContrastedColor(
    color: string,
    backgroundColor: string,
    contrastLevel = DEFAULT_CONTRAST_LEVEL
) {
    try {
        let count = 0
        let textColor = color
        const backgroundColorRGB = toRgba(backgroundColor)
        let contrast = getContrast(textColor, backgroundColorRGB)

        while (contrast < contrastLevel && count < 5) {
            textColor = lighten(textColor, 0.1)
            contrast = getContrast(textColor, backgroundColorRGB)
            count += 1
        }
        return textColor
    } catch (err) {
        return color
    }
}

export function isValidColor(value: string) {
    const style = new Option().style
    style.color = value
    return !!style.color
}
