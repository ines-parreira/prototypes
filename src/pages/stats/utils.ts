import {ChartArea, TooltipItem} from 'chart.js'
import moment from 'moment'

import {toRGBA} from 'utils'
import {formatPercentage} from 'pages/common/utils/numbers'
import {getFormat} from 'pages/stats/common/utils'
import {ReportingGranularity} from 'models/reporting/types'
import {
    MONTH_AND_YEAR_SHORT,
    SHORT_DATE_FORMAT_US,
    SHORT_DATE_FORMAT_WORLD,
    SHORT_DATE_WITH_DAY_OF_THE_WEEK_FORMAT_US,
    SHORT_DATE_WITH_DAY_OF_THE_WEEK_FORMAT_WORLD,
} from 'utils/date'

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

export const formatDates = (
    granularity: ReportingGranularity,
    dateTime: string
) => {
    const date = moment(dateTime)
    let format = getFormat(granularity)
    const isUsFormat = window.navigator.language === 'en-US'

    switch (granularity) {
        case ReportingGranularity.Day:
            format = isUsFormat
                ? SHORT_DATE_WITH_DAY_OF_THE_WEEK_FORMAT_US
                : SHORT_DATE_WITH_DAY_OF_THE_WEEK_FORMAT_WORLD
            break
        case ReportingGranularity.Week:
            format = isUsFormat ? SHORT_DATE_FORMAT_US : SHORT_DATE_FORMAT_WORLD
            break
        case ReportingGranularity.Month:
            format = MONTH_AND_YEAR_SHORT
            break
    }

    if (granularity === ReportingGranularity.Week) {
        return `${date
            .clone()
            .subtract(6, 'days')
            .format(format)} - ${date.format(format)}`
    }

    return date.format(format)
}

export const getPeriodEndDateTime = (
    startDateTime: string,
    granularity: ReportingGranularity
) => {
    const startDate = moment(startDateTime)

    if (granularity === ReportingGranularity.Week) {
        return moment(startDate).clone().subtract(6, 'days').toISOString()
    }

    return moment(startDate).clone().subtract(1, granularity).toISOString()
}
