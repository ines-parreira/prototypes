import {
    getContrast,
    hasBadContrast,
    hsla,
    lighten,
    parseToHsla,
    parseToRgba,
    rgba,
    toHex,
} from 'color2k'

type ColorBucket =
    | 'achromatic'
    | 'darkChromatic'
    | 'midChromatic'
    | 'lightChromatic'

export type LauncherColors = {
    bucket: ColorBucket
    iconColor: string
    dotsColor: string
    labelColor: string
    closeIconColor: string
    glowStop0: string
    glowStop50: string
    glowStop100: string
    sheenStop0: string
    sheenStop100: string
    bloomColor: string
    badgeBackgroundColor: string
    badgeFontColor: string
}

const WHITE = '#FFFFFF'
const DARK = '#1C1C1C'

const GLOW_OPACITY: Record<ColorBucket, number> = {
    achromatic: 0.45,
    darkChromatic: 0.3,
    midChromatic: 0.4,
    lightChromatic: 0.35,
}

const NEUTRAL_COLOR: Record<ColorBucket, string> = {
    achromatic: '#F2F2F2',
    darkChromatic: '#F5F5F5',
    midChromatic: '#F5F5F5',
    lightChromatic: '#F7F7F7',
}

const SHEEN_OPACITY: Record<ColorBucket, number> = {
    achromatic: 0.1,
    darkChromatic: 0.1,
    midChromatic: 0.1,
    lightChromatic: 0.3,
}

function colorToRGBA(color: string, alpha: number): string {
    const [r, g, b] = parseToRgba(color)
    return rgba(r, g, b, alpha)
}

function getContrastIconColor(brand: string): string {
    return getContrast(WHITE, brand) >= getContrast(DARK, brand) ? WHITE : DARK
}

export function deriveLauncherColors(brandPrimary: string): LauncherColors {
    let brand: string

    try {
        const normalizedInput = /^[0-9A-Fa-f]{3,6}$/.test(brandPrimary)
            ? `#${brandPrimary}`
            : brandPrimary

        brand = toHex(normalizedInput)
    } catch {
        brand = '#808080'
    }

    const [h, s, l, a] = parseToHsla(brand)

    let bucket: ColorBucket
    if (s <= 0.1) {
        bucket = 'achromatic'
    } else if (l <= 0.45) {
        bucket = 'darkChromatic'
    } else if (l <= 0.75) {
        bucket = 'midChromatic'
    } else {
        bucket = 'lightChromatic'
    }

    const contrastColor = getContrastIconColor(brand)

    // Icon color: bucket-based, matching the real chat widget behavior
    // - lightChromatic: darken by 15% so the icon stays brand-colored but visible
    // - very bright achromatic (near-white): force black for contrast
    // - all others: use the brand color as-is
    const VERY_BRIGHT_THRESHOLD = 0.85
    let iconColor: string
    if (bucket === 'lightChromatic') {
        iconColor = toHex(lighten(brand, -0.15))
    } else if (bucket === 'achromatic' && l > VERY_BRIGHT_THRESHOLD) {
        iconColor = '#000000'
    } else {
        iconColor = brand
    }

    const labelColor = hasBadContrast(brand, 'aa', WHITE) ? DARK : brand

    // Close icon uses the same color as the bubble icon (matching gorgias-chat)
    const closeIconColor = iconColor

    // Dots inside the bubble icon (#F4F4F6 matches gorgias-chat's BubbleIcon default)
    const dotsColor = '#F4F4F6'

    let glowColor: string
    if (bucket === 'achromatic') {
        glowColor = '#DADADA'
    } else if (bucket === 'midChromatic') {
        glowColor = lighten(brand, 0.2)
    } else {
        glowColor = brand
    }

    const glowStop0 = WHITE
    const glowStop50 = NEUTRAL_COLOR[bucket]
    const glowStop100 = colorToRGBA(glowColor, GLOW_OPACITY[bucket])

    const sheenNeutralOpacity = bucket === 'lightChromatic' ? 1.0 : 0.6
    const sheenStop0 = colorToRGBA(NEUTRAL_COLOR[bucket], sheenNeutralOpacity)
    const sheenStop100 = colorToRGBA(brand, SHEEN_OPACITY[bucket])

    const highlight = s <= 0.1 ? WHITE : toHex(hsla(h, s, 0.95, a))
    const bloomColor = colorToRGBA(highlight, 0.6)

    let badgeBackgroundColor = brand
    let badgeFontColor = contrastColor
    if (hasBadContrast(badgeFontColor, 'aa', badgeBackgroundColor)) {
        badgeBackgroundColor = DARK
        badgeFontColor = WHITE
    }

    return {
        bucket,
        iconColor,
        dotsColor,
        labelColor,
        closeIconColor,
        glowStop0,
        glowStop50,
        glowStop100,
        sheenStop0,
        sheenStop100,
        bloomColor,
        badgeBackgroundColor,
        badgeFontColor,
    }
}
