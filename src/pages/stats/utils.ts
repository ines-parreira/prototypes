import {ChartArea, TooltipItem} from 'chart.js'

import {toRGBA} from 'utils'
import {formatPercentage} from 'pages/common/utils/numbers'

export const NUMBER_TICK_FORMATTER = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
} as Intl.NumberFormatOptions)

export const TICKET_CUSTOM_FIELDS_API_SEPARATOR = '::'
export const TICKET_CUSTOM_FIELDS_NEW_SEPARATOR = ' > '

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

export const renderTooltipLabelAsPercentage = (
    context: TooltipItem<'line'>
) => {
    const label = context?.dataset?.label || ''
    if (typeof context.parsed.y === 'number') {
        const formattedValue = formatPercentage(context.parsed.y)
        return label ? `${label}: ${formattedValue}` : formattedValue
    }

    return label
}

export const renderTickLabelAsPercentage = (value: string | number) => {
    if (typeof value === 'number') {
        return formatPercentage(value)
    }
    return value
}

export const renderTickLabelAsNumber = (value: string | number) => {
    if (typeof value === 'number') {
        return NUMBER_TICK_FORMATTER.format(value)
    }
    return value
}
