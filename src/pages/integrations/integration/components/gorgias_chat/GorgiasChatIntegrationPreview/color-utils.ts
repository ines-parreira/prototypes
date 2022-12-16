import {getContrast} from 'color2k'

export enum CONSTRAST_COLORS {
    LIGHT = '#FFFFFF',
    DARK = '#161616',
}
const DEFAULT_CONTRAST_LEVEL = 2.8

export function getTextColorBasedOnBackground(
    mainColor: string,
    contrastLevel = DEFAULT_CONTRAST_LEVEL
): string {
    if (!mainColor) {
        return CONSTRAST_COLORS.LIGHT
    }

    try {
        const lightTextContrast = getContrast(
            mainColor.trim(),
            CONSTRAST_COLORS.LIGHT
        )

        return lightTextContrast >= contrastLevel
            ? CONSTRAST_COLORS.LIGHT
            : CONSTRAST_COLORS.DARK
    } catch (err) {
        return CONSTRAST_COLORS.LIGHT
    }
}
