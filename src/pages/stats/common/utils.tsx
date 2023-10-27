import {useContext, useMemo} from 'react'
import moment, {Moment} from 'moment'
import _isNumber from 'lodash/isNumber'
import {findKey} from 'lodash'
import {TicketMessagesMember} from 'models/reporting/cubes/TicketMessagesCube'

import useAppSelector from 'hooks/useAppSelector'
import {ViewFilter} from 'state/views/types'
import {getTicketViewField, getTicketViewFieldPath} from 'config/views'
import {ViewField} from 'models/view/types'
import {
    CollectionOperator,
    DatetimeOperator,
    EqualityOperator,
} from 'state/rules/types'
import {RootState} from 'state/types'
import {ReportingGranularity} from 'models/reporting/types'
import {TicketChannel} from 'business/types/ticket'
import {TICKET_CHANNEL_NAMES} from 'state/ticket/constants'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'

import {ReportingMetricItem} from 'hooks/reporting/useMetricPerDimension'
import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {HelpdeskMessageMember} from 'models/reporting/cubes/HelpdeskMessageCube'
import StatsFiltersContext from '../StatsFiltersContext'

export const DEFAULT_LOCALE = 'en-US'
export const NOT_AVAILABLE_TEXT = 'N/A'
export const NOT_AVAILABLE_PLACEHOLDER = '-'

export const comparedPeriodString = (
    previousStartDatetime: Moment,
    previousEndDatetime: Moment
) => {
    let previousPeriod = `${previousStartDatetime.format(
        'MMM DD, YYYY'
    )} - ${previousEndDatetime.format('MMM DD, YYYY')}`

    if (previousStartDatetime.isSame(previousEndDatetime, 'day')) {
        previousPeriod = previousStartDatetime.format('MMM DD, YYYY')
    }

    return `Compared to: ${previousPeriod}`
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
    if (!value) {
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
        const {period, channels, integrations, agents, tags} = statsFilters

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
                    getTicketViewField(ViewField.Channel)
                ),
                operator:
                    channels.length > 1
                        ? CollectionOperator.ContainsAny
                        : EqualityOperator.Eq,
                right: JSON.stringify(
                    channels.length > 1 ? channels : channels[0]
                ),
            })
        }

        if (integrations?.length) {
            filters.push({
                left: getTicketViewFieldPath(
                    getTicketViewField(ViewField.Integrations)
                ),
                operator:
                    integrations.length > 1
                        ? CollectionOperator.ContainsAny
                        : EqualityOperator.Eq,
                right: JSON.stringify(
                    integrations.length > 1 ? integrations : integrations[0]
                ),
            })
        }

        if (agents?.length) {
            filters.push({
                left: getTicketViewFieldPath(
                    getTicketViewField(ViewField.Assignee)
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
                        getTicketViewField(ViewField.Tags)
                    ),
                    operator: CollectionOperator.ContainsAny,
                    right: JSON.stringify(tagNames),
                })
            }
        }

        return filters
    }, [periodFilterLeft, tagsState, statsFilters])
}

export const findChannelNameKey = (
    channelName: string
): TicketChannel | undefined => {
    return findKey(
        TICKET_CHANNEL_NAMES,
        (name) => name.toLowerCase() === channelName.toLowerCase()
    ) as TicketChannel | undefined
}

export type MetricValueFormat =
    | 'decimal'
    | 'integer'
    | 'duration'
    | 'percent'
    | 'percent-refined'

const metricToDecimal = (
    value: number,
    formatOptions?: Intl.NumberFormatOptions
) =>
    value.toLocaleString(DEFAULT_LOCALE, {
        maximumFractionDigits: 2,
        ...formatOptions,
    })

const metricToInteger = (value: number) =>
    value.toLocaleString(DEFAULT_LOCALE, {
        maximumFractionDigits: 0,
    })

export const formatMetricValue = (
    value: number | null | undefined,
    format: MetricValueFormat = 'decimal',
    notAvailableText: string = NOT_AVAILABLE_TEXT
) => {
    if (value === null || value === undefined) {
        return notAvailableText
    }

    if (format === 'duration') {
        return formatDuration(value, 2)
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

    return metricToDecimal(value)
}

export type MetricTrendFormat = 'decimal' | 'duration' | 'percent'
export const formatMetricTrend = (
    value: number,
    prevValue: number,
    format: MetricTrendFormat
) => {
    const diff = value - prevValue
    const absDiff = Math.abs(diff)
    let formattedDiff: string | null

    if (format === 'duration') {
        formattedDiff = formatDuration(absDiff, 1)
    } else if (format === 'percent') {
        const value = absDiff / prevValue || 0
        formattedDiff = Number.isFinite(value)
            ? new Intl.NumberFormat(DEFAULT_LOCALE, {
                  style: 'percent',
                  maximumFractionDigits: 0,
              }).format(value)
            : null
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
    format: string
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
    granularity: ReportingGranularity
) => {
    const format = getFormat(granularity)

    return data.map((items) => formatTimeSeries(label, items, format))
}

export const formatLabeledTimeSeriesData = (
    data: TimeSeriesDataItem[][] = [],
    labels: string[],
    granularity: ReportingGranularity
) => {
    const format = getFormat(granularity)

    return data.map((items, index) =>
        formatTimeSeries(labels[index], items, format)
    )
}

export const formatLabeledTooltipTimeSeriesData = (
    data: TimeSeriesDataItem[][] = [],
    legendInfo: {labels: string[]; tooltips: string[]},
    granularity: ReportingGranularity
) => {
    const format = getFormat(granularity)

    return data.map((items, index) => ({
        ...formatTimeSeries(legendInfo.labels[index], items, format),
        tooltip: legendInfo.tooltips[index],
    }))
}

export const isMetricForAgent = (
    metric: ReportingMetricItem,
    agentId: number | string
) =>
    metric[TicketMember.AssigneeUserId] === String(agentId) ||
    metric[TicketMessagesMember.FirstHelpdeskMessageUserId] ===
        String(agentId) ||
    metric[HelpdeskMessageMember.SenderId] === String(agentId)
