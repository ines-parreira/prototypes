import {ChartArea} from 'chart.js'

import {toRGBA} from 'utils'

export const NUMBER_TICK_FORMATTER = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
} as Intl.NumberFormatOptions)

export function getGradient(
    color: string,
    canvasArea?: ChartArea,
    canvasContext?: CanvasRenderingContext2D
): CanvasGradient | string {
    if (!canvasContext || !canvasArea) {
        return color
    }
    const gradient = canvasContext.createLinearGradient(
        0,
        0,
        0,
        canvasArea.bottom
    )
    gradient.addColorStop(0, toRGBA(color, 0.2))
    gradient.addColorStop(1, toRGBA(color, 0))

    return gradient
}
