import { useContext, useMemo } from 'react'

import _isNumber from 'lodash/isNumber'
import moment, { Moment } from 'moment-timezone'

import { getTicketViewField, getTicketViewFieldPath } from 'config/views'
import { DateTimeResultFormatType } from 'constants/datetime'
import { ReportingMetricItem } from 'hooks/reporting/useMetricPerDimension'
import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import useAppSelector from 'hooks/useAppSelector'
import { ReportingGranularity } from 'models/reporting/types'
import { ViewField } from 'models/view/types'
import StatsFiltersContext from 'pages/stats/StatsFiltersContext'
import {
    CollectionOperator,
    DatetimeOperator,
    EqualityOperator,
} from 'state/rules/types'
import { RootState } from 'state/types'
import { ViewFilter } from 'state/views/types'
import { formatDatetime } from 'utils'

export const DEFAULT_LOCALE = 'en-US'
export const NOT_AVAILABLE_TEXT = 'N/A'
export const NOT_AVAILABLE_PLACEHOLDER = '-'

export enum StartDayOfWeek {
    Sunday = 'sunday',
    Monday = 'monday',
}

export const comparedPeriodString = (
    previousStartDatetime: Moment,
    previousEndDatetime: Moment,
) => {
    let previousPeriod = `${previousStartDatetime.format(
        SHORT_FORMAT,
    )} - ${previousEndDatetime.format(SHORT_FORMAT)}`

    if (previousStartDatetime.isSame(previousEndDatetime, 'day')) {
        previousPeriod = previousStartDatetime.format(SHORT_FORMAT)
    }

    return `${previousPeriod}`
}

export const formatComparedPeriodString = (
    previousStartDatetime: Moment,
    previousEndDatetime: Moment,
) => {
    return `Compared to: ${comparedPeriodString(
        previousStartDatetime,
        previousEndDatetime,
    )}`
}

export const formatNumber = (value: number) => {
    const numberFormatter = new Intl.NumberFormat(DEFAULT_LOCALE)

    return numberFormatter.format(value)
}

// format a value and display it as a percentage
export const formatPercent = (value: unknown) => {
    return _isNumber(value) ? `${value}%` : ''
}

// format a value and display it as a currency
export const formatCurrency = (value: number, currency: string) => {
    if (!currency) {
        return value
    }

    return value.toLocaleString(DEFAULT_LOCALE, {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
    })
}

/**
 * Display a duration in days, hours, minutes and seconds
 */
export const formatDuration = (value: number, precision = 9) => {
    if (!value || (value > -1 && value < 1)) {
        return '0s'
    }

    const duration = moment.duration(value, 'seconds')
    let currentPrecision = 0
    const parts = [
        [duration.months(), 'mo'],
        [duration.days(), 'd'],
        [duration.hours(), 'h'],
        [duration.minutes(), 'm'],
        [duration.seconds(), 's'],
    ].reduce<string[]>((acc, [num, unit]) => {
        if (num && currentPrecision < precision) {
            acc.push(`${num}${unit}`.padStart(3, '0'))
            currentPrecision++
        }
        return acc
    }, [])

    const result = parts.join(' ')

    if (result.startsWith('0')) {
        return result.slice(1)
    }
    return result
}

export const useStatsViewFilters = (periodFilterLeft: string): ViewFilter[] => {
    const statsFilters = useContext(StatsFiltersContext)
    const tagsState = useAppSelector((state: RootState) => state.entities.tags)
    return useMemo(() => {
        const filters: ViewFilter[] = []
        const { period, channels, integrations, agents, tags } = statsFilters

        filters.push({
            left: periodFilterLeft,
            operator: DatetimeOperator.GTE,
            // TODO: remove .utc() after https://linear.app/gorgias/issue/COR-529/display-view-date-filters-in-the-user-timezone
            right: `'${moment(period.start_datetime).utc().format()}'`,
        })

        filters.push({
            left: periodFilterLeft,
            operator: DatetimeOperator.LTE,
            // TODO: remove .utc() after https://linear.app/gorgias/issue/COR-529/display-view-date-filters-in-the-user-timezone
            right: `'${moment(period.end_datetime).utc().format()}'`,
        })

        if (channels?.length) {
            filters.push({
                left: getTicketViewFieldPath(
                    getTicketViewField(ViewField.Channel),
                ),
                operator:
                    channels.length > 1
                        ? CollectionOperator.ContainsAny
                        : EqualityOperator.Eq,
                right: JSON.stringify(
                    channels.length > 1 ? channels : channels[0],
                ),
            })
        }

        if (integrations?.length) {
            filters.push({
                left: getTicketViewFieldPath(
                    getTicketViewField(ViewField.Integrations),
                ),
                operator:
                    integrations.length > 1
                        ? CollectionOperator.ContainsAny
                        : EqualityOperator.Eq,
                right: JSON.stringify(
                    integrations.length > 1 ? integrations : integrations[0],
                ),
            })
        }

        if (agents?.length) {
            filters.push({
                left: getTicketViewFieldPath(
                    getTicketViewField(ViewField.Assignee),
                ),
                operator:
                    agents.length > 1
                        ? CollectionOperator.ContainsAny
                        : EqualityOperator.Eq,
                right: JSON.stringify(agents.length > 1 ? agents : agents[0]),
            })
        }

        if (tags?.length) {
            const tagNames = []
            for (const tagId of tags) {
                const tag = tagsState[tagId]
                if (tag) {
                    tagNames.push(tag.name)
                }
            }
            if (tagNames.length) {
                filters.push({
                    left: getTicketViewFieldPath(
                        getTicketViewField(ViewField.Tags),
                    ),
                    operator: CollectionOperator.ContainsAny,
                    right: JSON.stringify(tagNames),
                })
            }
        }

        return filters
    }, [periodFilterLeft, tagsState, statsFilters])
}

export type MetricValueFormat =
    | 'decimal'
    | 'integer'
    | 'duration'
    | 'percent'
    | 'percent-refined'
    | 'decimal-to-percent'
    | 'decimal-percent-to-integer-percent'
    | 'currency'
    | 'ratio'

const metricToDecimal = (
    value: number,
    formatOptions?: Intl.NumberFormatOptions,
) => {
    return value.toLocaleString(DEFAULT_LOCALE, {
        maximumFractionDigits: 2,
        ...formatOptions,
    })
}

const metricToInteger = (value: number) =>
    value.toLocaleString(DEFAULT_LOCALE, {
        maximumFractionDigits: 0,
    })

export const formatMetricValue = (
    value: number | null | undefined,
    format: MetricValueFormat = 'decimal',
    notAvailableText: string = NOT_AVAILABLE_TEXT,
) => {
    if (value === null || value === undefined) {
        return notAvailableText
    }

    if (format === 'duration') {
        return formatDuration(value, 2)
    }

    if (format === 'decimal-to-percent') {
        return `${metricToDecimal(value * 100)}%`
    }

    if (format === 'percent') {
        return `${metricToDecimal(value)}%`
    }

    if (format === 'percent-refined') {
        return `${metricToDecimal(value, {
            maximumFractionDigits: value > 0.5 ? 0 : 1,
        })}%`
    }

    if (format === 'integer') {
        return metricToInteger(Math.ceil(value))
    }

    if (format === 'decimal-percent-to-integer-percent') {
        return `${metricToInteger(Math.round(value * 100))}%`
    }

    if (format === 'currency') {
        return `${formatCurrency(value, 'USD')}`
    }

    if (format === 'ratio') {
        return `${metricToDecimal(value)}x`
    }

    return metricToDecimal(value)
}

export type MetricTrendFormat =
    | 'decimal'
    | 'duration'
    | 'percent'
    | 'decimal-to-percent'
    | 'currency'
    | 'ratio'

const formatTrendAsPercent = (prevValue: number, absDiff: number) => {
    const value = absDiff / prevValue || 0
    return Number.isFinite(value)
        ? new Intl.NumberFormat(DEFAULT_LOCALE, {
              style: 'percent',
              maximumFractionDigits: 0,
          }).format(value)
        : null
}

export const formatMetricTrend = (
    value: number,
    prevValue: number,
    format: MetricTrendFormat,
) => {
    const diff = value - prevValue
    const absDiff = Math.abs(diff)
    let formattedDiff: string | null

    if (format === 'duration') {
        formattedDiff = formatDuration(absDiff, 1)
    } else if (format === 'decimal-to-percent') {
        formattedDiff = formatTrendAsPercent(prevValue * 100, absDiff * 100)
    } else if (format === 'percent') {
        formattedDiff = formatTrendAsPercent(prevValue, absDiff)
    } else {
        formattedDiff = Intl.NumberFormat(DEFAULT_LOCALE, {
            maximumFractionDigits: 1,
        }).format(absDiff)
    }

    if (formattedDiff === null || parseFloat(formattedDiff) === 0) {
        return {
            formattedTrend: formattedDiff,
        }
    }

    return {
        formattedTrend: formattedDiff,
        sign: diff > 0 ? 1 : diff < 0 ? -1 : 0,
    }
}

export const SHORT_FORMAT = 'MMM Do, YYYY'

export const getFormat = (granularity: ReportingGranularity) =>
    granularity === ReportingGranularity.Hour ? 'LT' : SHORT_FORMAT

const formatTimeSeries = (
    label: string,
    items: TimeSeriesDataItem[],
    format: string,
) => ({
    label: label,
    values: items.map((item) => ({
        x: moment(item.dateTime).format(format),
        y: item.value,
    })),
})

export const formatTimeSeriesData = (
    data: TimeSeriesDataItem[][] = [],
    label: string,
    granularity: ReportingGranularity,
) => {
    const format = getFormat(granularity)

    return data.map((items) => formatTimeSeries(label, items, format))
}

export const formatLabeledTimeSeriesData = (
    data: TimeSeriesDataItem[][] = [],
    labels: string[],
    granularity: ReportingGranularity,
) => {
    const format = getFormat(granularity)

    return data.map((items, index) =>
        formatTimeSeries(labels[index], items, format),
    )
}

export const formatLabeledTooltipTimeSeriesData = (
    data: TimeSeriesDataItem[][] = [],
    legendInfo: { labels: string[]; tooltips: string[] },
    granularity: ReportingGranularity,
    dashedItems?: Array<boolean>,
) => {
    const format = getFormat(granularity)

    return data.map((items, index) => ({
        ...formatTimeSeries(legendInfo.labels[index], items, format),
        tooltip: legendInfo.tooltips[index],
        isDashed: dashedItems?.[index],
    }))
}

export const isMetricForAgent = (
    metric: ReportingMetricItem,
    agentId: number | string,
    agentIdFields: string[],
) => {
    return agentIdFields.reduce(
        (acc, agentIdField) =>
            metric[agentIdField] === String(agentId) ? true : acc,
        false,
    )
}

export const periodPickerMaxSpanDays = (
    maxSpan?: daterangepicker.Options['maxSpan'],
    minDate?: daterangepicker.Options['minDate'],
) => {
    if (!minDate && maxSpan) {
        return Number(maxSpan)
    }

    if (minDate && maxSpan) {
        const today = moment()
        const minDateToStart = moment(minDate)
        const diffInDaysBetweenMinDateAndMaxSpan = today.diff(
            minDateToStart,
            'days',
        )
        return Math.min(diffInDaysBetweenMinDateAndMaxSpan, Number(maxSpan))
    }

    return NOT_AVAILABLE_PLACEHOLDER
}

export const getDateRangePickerLabel = (
    startDate: Moment,
    endDate: Moment,
    labelDateFormat: DateTimeResultFormatType,
) => {
    const start = formatDatetime(startDate, labelDateFormat).toString()
    const end = formatDatetime(endDate, labelDateFormat).toString()

    if (start === end) {
        return start
    }

    return `${start} - ${end}`
}

export const startOfToday = () => moment().startOf('day')
export const dateInPastFromStartOfToday = (daysToSubtract: number) =>
    startOfToday().subtract(daysToSubtract - 1, 'days')
export const endOfToday = () => moment().endOf('day')
export const startOfYear = () => moment().startOf('year')
export const last365DaysStartingFromToday = () =>
    startOfToday().subtract(365, 'days')
export const startOfMonth = () => moment().startOf('month')
export const startOfLastMonth = () => startOfMonth().subtract(1, 'months')
export const endOfLastMonth = () => startOfMonth().subtract(1, 'seconds')
export const lastWeekDateRange = (startWeekDay: StartDayOfWeek) => {
    const weekStartMomentActual =
        startWeekDay === StartDayOfWeek.Sunday ? 'week' : 'isoWeek'
    const start = moment().startOf(weekStartMomentActual).subtract(1, 'weeks')
    const end = moment().startOf(weekStartMomentActual).subtract(1, 'seconds')
    return { start, end }
}

export function move<T>(array: T[], srcIndex: number, targetIndex: number) {
    const copy = [...array]
    const [movedChart] = copy.splice(srcIndex, 1)
    copy.splice(targetIndex, 0, movedChart)
    return copy
}
