import { getContrast, lighten, toRgba } from 'color2k'

const DEFAULT_CONTRAST_LEVEL = 3.5

/**
 * Updates a given color to get enough contrast compared to the other one
 * If it is lighter than the second one, we assume we want it to be lighter.
 * Inversely, if it is darker, we darken it.
 *
 */
export function getEnoughContrastedColor(
    color: string,
    backgroundColor: string,
    contrastLevel = DEFAULT_CONTRAST_LEVEL,
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
    } catch {
        return color
    }
}

export function isValidColor(value: string) {
    const style = new Option().style
    style.color = value
    return !!style.color
}
