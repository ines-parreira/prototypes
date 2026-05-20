import { useMemo } from 'react'

export const EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS =
    'message-body-element-with-authored-background'
export const EMAIL_ELEMENT_WITH_AUTHORED_LIGHT_BACKGROUND_CLASS =
    'message-body-element-with-authored-light-background'
export const EMAIL_ELEMENT_WITH_AUTHORED_DARK_BACKGROUND_CLASS =
    'message-body-element-with-authored-dark-background'

const BACKGROUND_ATTRIBUTE_PATTERN = /\s(?:style|bgcolor)\s*=/i
const BACKGROUND_DECLARATION_PATTERN =
    /(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/gi
const EMPTY_BACKGROUND_VALUE_PATTERN =
    /^(transparent|none|inherit|initial|unset|rgba\([^)]*,\s*0(?:\.0+)?\)|hsla\([^)]*,\s*0(?:\.0+)?\))$/i
const HEX_COLOR_PATTERN =
    /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const RGB_COLOR_PATTERN = /^rgba?\((.*)\)$/i

type RgbColor = {
    alpha: number
    blue: number
    green: number
    red: number
}

const CSS_COLOR_KEYWORDS: Record<string, RgbColor> = {
    black: { red: 0, green: 0, blue: 0, alpha: 1 },
    blue: { red: 0, green: 0, blue: 255, alpha: 1 },
    darkgray: { red: 169, green: 169, blue: 169, alpha: 1 },
    darkgrey: { red: 169, green: 169, blue: 169, alpha: 1 },
    gray: { red: 128, green: 128, blue: 128, alpha: 1 },
    green: { red: 0, green: 128, blue: 0, alpha: 1 },
    grey: { red: 128, green: 128, blue: 128, alpha: 1 },
    lightgray: { red: 211, green: 211, blue: 211, alpha: 1 },
    lightgrey: { red: 211, green: 211, blue: 211, alpha: 1 },
    red: { red: 255, green: 0, blue: 0, alpha: 1 },
    silver: { red: 192, green: 192, blue: 192, alpha: 1 },
    transparent: { red: 255, green: 255, blue: 255, alpha: 0 },
    white: { red: 255, green: 255, blue: 255, alpha: 1 },
    yellow: { red: 255, green: 255, blue: 0, alpha: 1 },
}

function normalizeCssValue(value: string): string {
    return value.replace(/\s*!important\s*$/i, '').trim()
}

function hasPaintedBackgroundValue(value: string | null): boolean {
    if (!value) {
        return false
    }

    const normalizedValue = normalizeCssValue(value)

    return (
        normalizedValue.length > 0 &&
        !EMPTY_BACKGROUND_VALUE_PATTERN.test(normalizedValue)
    )
}

function hasPaintedBackgroundDeclaration(style: string): boolean {
    BACKGROUND_DECLARATION_PATTERN.lastIndex = 0

    return Array.from(style.matchAll(BACKGROUND_DECLARATION_PATTERN)).some(
        (match) => hasPaintedBackgroundValue(match[1]),
    )
}

function hasAuthoredBackground(element: HTMLElement): boolean {
    return (
        hasPaintedBackgroundValue(element.getAttribute('bgcolor')) ||
        hasPaintedBackgroundDeclaration(element.getAttribute('style') ?? '')
    )
}

function normalizeColorChannel(channel: number): number {
    return Math.min(Math.max(channel, 0), 255)
}

function normalizeAlpha(alpha: number): number {
    return Math.min(Math.max(alpha, 0), 1)
}

function parseColorChannel(value: string): number | null {
    const normalizedValue = value.trim()
    const parsedValue = Number.parseFloat(normalizedValue)

    if (Number.isNaN(parsedValue)) {
        return null
    }

    if (normalizedValue.endsWith('%')) {
        return normalizeColorChannel((parsedValue / 100) * 255)
    }

    return normalizeColorChannel(parsedValue)
}

function parseAlphaChannel(value: string | undefined): number {
    if (!value) {
        return 1
    }

    const normalizedValue = value.trim()
    const parsedValue = Number.parseFloat(normalizedValue)

    if (Number.isNaN(parsedValue)) {
        return 1
    }

    if (normalizedValue.endsWith('%')) {
        return normalizeAlpha(parsedValue / 100)
    }

    return normalizeAlpha(parsedValue)
}

function parseHexColor(value: string): RgbColor | null {
    const match = value.match(HEX_COLOR_PATTERN)

    if (!match) {
        return null
    }

    const hex = match[1]
    const redHex = hex.length <= 4 ? hex[0] + hex[0] : hex.slice(0, 2)
    const greenHex = hex.length <= 4 ? hex[1] + hex[1] : hex.slice(2, 4)
    const blueHex = hex.length <= 4 ? hex[2] + hex[2] : hex.slice(4, 6)
    const alphaHex =
        hex.length === 4
            ? hex[3] + hex[3]
            : hex.length === 8
              ? hex.slice(6, 8)
              : null

    return {
        red: Number.parseInt(redHex, 16),
        green: Number.parseInt(greenHex, 16),
        blue: Number.parseInt(blueHex, 16),
        alpha: alphaHex ? Number.parseInt(alphaHex, 16) / 255 : 1,
    }
}

function parseRgbColor(value: string): RgbColor | null {
    const match = value.match(RGB_COLOR_PATTERN)

    if (!match) {
        return null
    }

    const [channelsValue, slashAlphaValue] = match[1].split('/')
    const colorChannels = channelsValue.includes(',')
        ? channelsValue.split(',').map((channel) => channel.trim())
        : channelsValue.trim().split(/\s+/)

    if (colorChannels.length < 3) {
        return null
    }

    const red = parseColorChannel(colorChannels[0])
    const green = parseColorChannel(colorChannels[1])
    const blue = parseColorChannel(colorChannels[2])

    if (red === null || green === null || blue === null) {
        return null
    }

    return {
        red,
        green,
        blue,
        alpha: parseAlphaChannel(slashAlphaValue ?? colorChannels[3]),
    }
}

function parseCssColor(value: string | null): RgbColor | null {
    if (!value) {
        return null
    }

    const normalizedValue = normalizeCssValue(value).toLowerCase()

    return (
        CSS_COLOR_KEYWORDS[normalizedValue] ??
        parseHexColor(normalizedValue) ??
        parseRgbColor(normalizedValue)
    )
}

function blendOverWhite(color: RgbColor): RgbColor {
    const inverseAlpha = 1 - color.alpha

    return {
        red: color.red * color.alpha + 255 * inverseAlpha,
        green: color.green * color.alpha + 255 * inverseAlpha,
        blue: color.blue * color.alpha + 255 * inverseAlpha,
        alpha: 1,
    }
}

function getLinearColorChannel(channel: number): number {
    const srgb = channel / 255

    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
}

function getRelativeLuminance(color: RgbColor): number {
    return (
        0.2126 * getLinearColorChannel(color.red) +
        0.7152 * getLinearColorChannel(color.green) +
        0.0722 * getLinearColorChannel(color.blue)
    )
}

function getContrastRatio(lighterLuminance: number, darkerLuminance: number) {
    return (lighterLuminance + 0.05) / (darkerLuminance + 0.05)
}

function getAuthoredBackgroundColor(element: HTMLElement): string | null {
    if (hasPaintedBackgroundValue(element.style.backgroundColor)) {
        return element.style.backgroundColor
    }

    return element.getAttribute('bgcolor')
}

function getReadableTextColorClass(element: HTMLElement): string | null {
    const backgroundColor = parseCssColor(getAuthoredBackgroundColor(element))

    if (!backgroundColor || backgroundColor.alpha === 0) {
        return null
    }

    const backgroundLuminance = getRelativeLuminance(
        blendOverWhite(backgroundColor),
    )
    const contrastWithDarkText = getContrastRatio(backgroundLuminance, 0)
    const contrastWithLightText = getContrastRatio(1, backgroundLuminance)

    return contrastWithDarkText >= contrastWithLightText
        ? EMAIL_ELEMENT_WITH_AUTHORED_LIGHT_BACKGROUND_CLASS
        : EMAIL_ELEMENT_WITH_AUTHORED_DARK_BACKGROUND_CLASS
}

export function annotateDarkModeReadableEmailHtml(html: string): string {
    if (!BACKGROUND_ATTRIBUTE_PATTERN.test(html)) {
        return html
    }

    if (typeof document === 'undefined') {
        return html
    }

    const template = document.createElement('template')
    template.innerHTML = html

    const elements = Array.from(
        template.content.querySelectorAll<HTMLElement>('*'),
    )

    elements.forEach((element) => {
        if (hasAuthoredBackground(element)) {
            element.classList.add(EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS)

            const readableTextColorClass = getReadableTextColorClass(element)

            if (readableTextColorClass) {
                element.classList.add(readableTextColorClass)
            }
        }
    })

    return template.innerHTML
}

export function useDarkModeReadableEmailHtml(html: string): string {
    return useMemo(() => annotateDarkModeReadableEmailHtml(html), [html])
}
