import { useContext, useMemo } from 'react'

import { UNDEFINED_VARIATION_TEXT } from '@repo/reporting'
import type { DateTimeResultFormatType } from '@repo/utils'
import { formatDatetime } from '@repo/utils'
import _isNumber from 'lodash/isNumber'
import type { Moment } from 'moment-timezone'
import moment from 'moment-timezone'

import { getTicketViewField, getTicketViewFieldPath } from 'config/views'
import type { ReportingMetricItem } from 'domains/reporting/hooks/types'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import StatsFiltersContext from 'domains/reporting/pages/StatsFiltersContext'
import { calculatePercentage } from 'domains/reporting/utils/reporting'
import useAppSelector from 'hooks/useAppSelector'
import { ViewField } from 'models/view/types'
import {
    CollectionOperator,
    DatetimeOperator,
    EqualityOperator,
} from 'state/rules/types'
import type { RootState } from 'state/types'
import type { ViewFilter } from 'state/views/types'

/**
 * @deprecated replaced by DEFAULT_LOCALE in @repo/reporting imports
 * @date 2025-08-29
 * @type reporting-ui-kit
 */
export const DEFAULT_LOCALE = 'en-US'
/**
 * @deprecated replaced by NOT_AVAILABLE_PLACEHOLDER in @repo/reporting imports
 * @date 2025-08-29
 * @type reporting-ui-kit
 */
export const NOT_AVAILABLE_PLACEHOLDER = '-'
/**
 * @deprecated replaced by NOT_AVAILABLE_TEXT in @repo/reporting imports
 * @date 2025-08-29
 * @type reporting-ui-kit
 */
export const NOT_AVAILABLE_TEXT = 'N/A'

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

/**
 * @deprecated replaced by formatCurrency in @repo/reporting imports
 * @date 2025-08-29
 * @type reporting-ui-kit
 */
export const formatCurrency = (
    value: number,
    currency: string,
    formatOptions?: Intl.NumberFormatOptions,
) => {
    if (!currency) {
        return value
    }

    return value.toLocaleString(DEFAULT_LOCALE, {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
        ...formatOptions,
    })
}

/**
 * @deprecated replaced by formatDuration in @repo/reporting imports
 * @date 2025-09-05
 * @type reporting-ui-kit
 */
export const formatDuration = (value: number, precision = 9) => {
    if (!value || (value > -1 && value < 1)) {
        return '0s'
    }

    const duration = moment.duration(value, 'seconds')
    let currentPrecision = 0
    const parts = [
        [duration.years(), 'y'],
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

/**
 * @deprecated replaced by MetricValueFormat in @repo/reporting imports
 * @date 2025-08-29
 * @type reporting-ui-kit
 */
export type MetricValueFormat =
    | 'decimal'
    | 'decimal-precision-1'
    | 'integer'
    | 'duration'
    | 'percent'
    | 'percent-precision-1'
    | 'percent-refined'
    | 'decimal-to-percent'
    | 'decimal-to-percent-precision-1'
    | 'decimal-percent-to-integer-percent'
    | 'currency'
    | 'currency-precision-1'
    | 'ratio'

/**
 * @deprecated replaced by metricToDecimal in @repo/reporting imports
 * @date 2025-08-29
 * @type reporting-ui-kit
 */
const metricToDecimal = (
    value: number,
    formatOptions?: Intl.NumberFormatOptions,
) => {
    return value.toLocaleString(DEFAULT_LOCALE, {
        maximumFractionDigits: 2,
        ...formatOptions,
    })
}

/**
 * @deprecated replaced by metricToInteger in @repo/reporting imports
 * @date 2025-08-29
 * @type reporting-ui-kit
 */
const metricToInteger = (value: number) =>
    value.toLocaleString(DEFAULT_LOCALE, {
        maximumFractionDigits: 0,
    })

/**
 * @deprecated replaced by formatMetricValue in @repo/reporting imports
 * @date 2025-08-29
 * @type reporting-ui-kit
 */
export const formatMetricValue = (
    value: number | null | undefined,
    format: MetricValueFormat = 'decimal',
    notAvailableText: string = NOT_AVAILABLE_TEXT,
    currency: string = 'USD',
) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return notAvailableText
    }

    if (format === 'duration') {
        return formatDuration(value, 2)
    }

    if (format === 'decimal-to-percent') {
        return `${metricToDecimal(value * 100)}%`
    }

    if (format === 'decimal-to-percent-precision-1') {
        return `${metricToDecimal(value * 100, {
            maximumFractionDigits: 1,
        })}%`
    }

    if (format === 'percent') {
        return `${metricToDecimal(value)}%`
    }

    if (format === 'percent-precision-1') {
        return `${metricToDecimal(value, {
            maximumFractionDigits: 1,
        })}%`
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
        return `${formatCurrency(value, currency)}`
    }

    if (format === 'currency-precision-1') {
        return `${formatCurrency(value, currency, {
            maximumFractionDigits: 1,
        })}`
    }

    if (format === 'ratio') {
        return `${metricToDecimal(value)}x`
    }

    if (format === 'decimal-precision-1') {
        return metricToDecimal(value, {
            maximumFractionDigits: 1,
        })
    }

    return metricToDecimal(value)
}

export type MetricTrendFormat =
    | 'decimal'
    | 'decimal-precision-1'
    | 'duration'
    | 'percent'
    | 'decimal-to-percent'
    | 'decimal-to-percent-precision-1'
    | 'currency'
    | 'currency-precision-1'
    | 'ratio'

/**
 * @deprecated replaced by formatTrendAsPercent in @repo/reporting imports
 * @date 2025-09-05
 * @type reporting-ui-kit
 */
const formatTrendAsPercent = (prevValue: number, absDiff: number) => {
    // When both values are 0, there's no change
    if (prevValue === 0 && absDiff === 0) {
        return new Intl.NumberFormat(DEFAULT_LOCALE, {
            style: 'percent',
            maximumFractionDigits: 0,
        }).format(0)
    }

    // When prevValue is 0 but there is a difference,
    // we cannot calculate a percentage
    if (prevValue === 0) {
        return UNDEFINED_VARIATION_TEXT
    }

    const value = absDiff / prevValue || 0
    return Number.isFinite(value)
        ? new Intl.NumberFormat(DEFAULT_LOCALE, {
              style: 'percent',
              maximumFractionDigits: 0,
          }).format(value)
        : null
}

/**
 * @deprecated replaced by formatMetricTrend in @repo/reporting imports
 * @date 2025-09-05
 * @type reporting-ui-kit
 */
export const formatMetricTrend = (
    value: number,
    prevValue: number,
    format: MetricTrendFormat,
): { formattedTrend: string | null; sign: number } => {
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

    if (
        formattedDiff === null ||
        parseFloat(formattedDiff) === 0 ||
        formattedDiff === UNDEFINED_VARIATION_TEXT // If the formatted diff is the undefined variation text, return it with sign 0
    ) {
        return {
            formattedTrend: formattedDiff,
            sign: 0,
        }
    }

    return {
        formattedTrend: formattedDiff,
        sign: diff > 0 ? 1 : diff < 0 ? -1 : 0,
    }
}

export const getFormattedPercentage = (value: number, total: number) => {
    return formatMetricValue(
        calculatePercentage(value, total) || null,
        'percent-refined',
        NOT_AVAILABLE_PLACEHOLDER,
    )
}

export const getFormattedDelta = (currentValue: number, previousValue = 0) => {
    const { formattedTrend, sign = 0 } = formatMetricTrend(
        currentValue,
        previousValue,
        'percent',
    )

    const prefix = sign > 0 ? '+' : sign < 0 ? '-' : ''

    const delta = formattedTrend || NOT_AVAILABLE_PLACEHOLDER

    return [prefix, delta].filter(Boolean).join(' ')
}

export const SHORT_FORMAT = 'MMM Do, YYYY'

export const getFormat = (granularity: ReportingGranularity) =>
    granularity === ReportingGranularity.Hour ? 'LT' : SHORT_FORMAT

export const formatTimeSeries = (
    label: string,
    items: TimeSeriesDataItem[],
    format: string,
    shouldDisableItem?: (label: string, items: TimeSeriesDataItem[]) => boolean,
) => ({
    label: label,
    values: items.map((item) => ({
        x: moment(item.dateTime).format(format),
        y: item.value,
    })),
    isDisabled: shouldDisableItem?.(label, items) || false,
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
    shouldDisableItem?: (label: string, items: TimeSeriesDataItem[]) => boolean,
) => {
    const format = getFormat(granularity)

    return data.map((items, index) =>
        formatTimeSeries(labels[index], items, format, shouldDisableItem),
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
            metric[agentIdField]?.toString() === agentId?.toString()
                ? true
                : acc,
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
