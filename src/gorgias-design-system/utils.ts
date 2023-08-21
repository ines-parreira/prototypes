/* eslint-disable @typescript-eslint/no-unused-vars */
import {parseToHsla, lighten, darken, getContrast} from 'color2k'

import {gorgiasColors} from './styles'

/**
 * Set the lightness of a color.
 * @param color The color to set the lightness for.
 * @param amount The amount to set the lightness for. A number between 0 and 1.
 */
export const setLightness = (color = '#000000', amount = 0.95) => {
    const [_hue, _saturation, lightness] = parseToHsla(color)

    if (lightness > amount) {
        return darken(color, lightness - amount)
    }

    return lighten(color, amount - lightness)
}

/**
 * Lighten a color relative to its current lightness.
 * @param color The color to lighten.
 * @param amount The amount to lighten the color by. A number between 0 and 1.
 */
export const relativeLighten = (color = '#000000', amount = 0.2) => {
    const [_hue, _saturation, lightness] = parseToHsla(color)

    return lighten(color, lightness * amount)
}

/**
 * Darken a color relative to its current lightness.
 * @param color The color to lighten.
 * @param amount The amount to lighten the color by. A number between 0 and 1.
 */
export const relativeDarken = (color = '#000000', amount = 0.2) => {
    const [_hue, _saturation, lightness] = parseToHsla(color)

    return darken(color, lightness * amount)
}

/**
 * Get the text color that has the higher contrast ratio with the given color.
 * The contrast ratio is calculated against the white and dark text colors.
 * @param color The color to calculate the contrast ratio for.
 * @param fallbackColor The color to return if the contrast ratio can't be calculated.
 */
export const getContrastColor = (
    color: string,
    fallbackColor = gorgiasColors.white
) => {
    const contrastRatioThreshold = 2.8

    const lightText = gorgiasColors.white
    const darkText = gorgiasColors.dark

    try {
        const lightTextContrast = getContrast(color, lightText)

        if (lightTextContrast > contrastRatioThreshold) {
            return lightText
        }
    } catch (err) {
        return fallbackColor
    }

    return darkText
}
