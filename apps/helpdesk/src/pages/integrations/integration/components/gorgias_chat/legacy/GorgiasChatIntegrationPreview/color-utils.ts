import { getContrast } from 'color2k'

export enum CONSTRAST_COLORS {
    LIGHT = '#FFFFFF',
    DARK = '#161616',
}
const DEFAULT_CONTRAST_LEVEL = 2.8

export function getTextColorBasedOnBackground(
    mainColor?: string,
    contrastLevel = DEFAULT_CONTRAST_LEVEL,
): CONSTRAST_COLORS {
    if (!mainColor) {
        return CONSTRAST_COLORS.LIGHT
    }

    try {
        const lightTextContrast = getContrast(
            mainColor.trim(),
            CONSTRAST_COLORS.LIGHT,
        )

        return lightTextContrast >= contrastLevel
            ? CONSTRAST_COLORS.LIGHT
            : CONSTRAST_COLORS.DARK
    } catch {
        return CONSTRAST_COLORS.LIGHT
    }
}

export function getThemeBasedOnContrast(
    mainColor: string,
    contrastLevel = DEFAULT_CONTRAST_LEVEL,
): string {
    try {
        const lightTextContrast = getContrast(
            mainColor.trim(),
            CONSTRAST_COLORS.LIGHT,
        )

        return lightTextContrast >= contrastLevel ? 'light' : 'dark'
    } catch {
        return 'light'
    }
}
