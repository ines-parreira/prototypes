import {ChartArea, TooltipItem} from 'chart.js'
import moment from 'moment'
import {ReportingGranularity} from 'models/reporting/types'
import {Period} from 'models/stat/types'
import {formatPercentage} from 'pages/common/utils/numbers'
import {comparedPeriodString, getFormat} from 'pages/stats/common/utils'

import {toRGBA} from 'utils'
import {
    MONTH_AND_YEAR_SHORT,
    SHORT_DATE_FORMAT_US,
    SHORT_DATE_FORMAT_WORLD,
    SHORT_DATE_WITH_DAY_OF_THE_WEEK_FORMAT_US,
    SHORT_DATE_WITH_DAY_OF_THE_WEEK_FORMAT_WORLD,
} from 'utils/date'
import {formatReportingQueryDate, getPreviousPeriod} from 'utils/reporting'

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
        return `${date.format(format)} - ${date
            .clone()
            .add(6, 'days')
            .format(format)}`
    }

    return date.format(format)
}

export const getUtcPeriodFromDateAndGranularity = (
    dateTime: string,
    granularity:
        | ReportingGranularity.Hour
        | ReportingGranularity.Day
        | ReportingGranularity.Week
        | ReportingGranularity.Month
) => {
    let startDate = moment.utc(dateTime).startOf('day').toISOString()
    let endDate = moment.utc(dateTime).endOf('day').toISOString()

    if (granularity === ReportingGranularity.Week) {
        endDate = moment.utc(dateTime).add(6, 'days').toISOString()
    } else if (granularity === ReportingGranularity.Month) {
        startDate = moment.utc(dateTime).startOf('month').toISOString()
        endDate = moment.utc(dateTime).endOf('month').toISOString()
    }

    return {
        start_datetime: formatReportingQueryDate(startDate),
        end_datetime: formatReportingQueryDate(endDate),
    }
}

export const getBadgeTooltipForPreviousPeriod = (
    statsFiltersPeriod: Period
) => {
    const period = getPreviousPeriod(statsFiltersPeriod)
    return comparedPeriodString(
        moment(period.start_datetime),
        moment(period.end_datetime)
    )
}

export const getIconNameBySign = (sign: number) => {
    if (sign > 0) {
        return 'arrow_upward'
    } else if (sign < 0) {
        return 'arrow_downward'
    }
    return null
}

export const highlightString = (text: string, highlight: string) => {
    if (!highlight) {
        return text
    }

    const regex = new RegExp(`(${highlight})`, 'gi')
    return text.replace(regex, '<b>$1</b>')
}
