import { useMemo } from 'react'

type MeasureTextWidthOptions = {
    fontSize?: string
    fontWeight?: string
}

export function measureTextWidth(
    text: string,
    { fontSize = '16px', fontWeight = '400' }: MeasureTextWidthOptions = {},
): number {
    if (!text) return 0

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return text.length * 8

    const tempElement = document.createElement('span')
    tempElement.style.cssText = `
            position: absolute;
            visibility: hidden;
            font-size: ${fontSize};
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-weight: ${fontWeight};
            line-height: normal;
        `
    tempElement.textContent = 'M' // Use a reference character
    document.body.appendChild(tempElement)

    const computedStyle = window.getComputedStyle(tempElement)
    const font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`

    document.body.removeChild(tempElement)

    context.font =
        font ||
        `${fontSize} -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

    const metrics = context.measureText(text)
    return Math.ceil(metrics.width)
}

export type UseTextWidthOptions = {
    padding?: number
    fontSize?: string
    fontWeight?: string
    enabled?: boolean
}

export const useTextWidth = (
    text: string,
    {
        padding = 0,
        fontSize = '16px',
        fontWeight = '400',
        enabled = true,
    }: UseTextWidthOptions = {},
) => {
    return useMemo(
        () =>
            enabled && text
                ? measureTextWidth(text, { fontSize, fontWeight }) + padding
                : 0,
        [enabled, text, fontSize, padding, fontWeight],
    )
}
