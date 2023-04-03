import {useContext, useMemo} from 'react'
import moment, {Moment} from 'moment'
import _isNumber from 'lodash/isNumber'

import {findKey} from 'lodash'
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

import {TicketChannel} from 'business/types/ticket'
import {TICKET_CHANNEL_NAMES} from 'state/ticket/constants'
import StatsFiltersContext from '../StatsFiltersContext'

export const DEFAULT_LOCALE = 'en-US'

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
    let curPrecision = 0
    const parts = [
        [duration.months(), 'mo'],
        [duration.days(), 'd'],
        [duration.hours(), 'h'],
        [duration.minutes(), 'm'],
        [duration.seconds(), 's'],
    ].reduce((acc, [num, unit]) => {
        if (num && curPrecision < precision) {
            acc.push(`${num}${unit}`)
            curPrecision++
        }
        return acc
    }, [] as string[])

    return parts.join(' ')
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

export type MetricValueFormat = 'decimal' | 'duration'
export const formatMetricValue = (value: number, format: MetricValueFormat) => {
    if (format === 'duration') {
        return formatDuration(value, 2)
    }

    return value.toLocaleString(DEFAULT_LOCALE, {
        maximumFractionDigits: 2,
    })
}

export type MetricTrendFormat = 'decimal' | 'duration' | 'percent'
export const formatMetricTrend = (
    value: number,
    prevValue: number,
    format: MetricTrendFormat
) => {
    const diff = value - prevValue
    const sign = diff > 0 ? '+' : diff < 0 ? '-' : ''
    const absDiff = Math.abs(diff)
    let formattedDiff: string

    if (format === 'duration') {
        formattedDiff = formatDuration(absDiff, 1)
    } else if (format === 'percent') {
        formattedDiff = new Intl.NumberFormat(DEFAULT_LOCALE, {
            style: 'percent',
            maximumFractionDigits: 0,
        }).format(absDiff / prevValue)
    } else {
        formattedDiff = Intl.NumberFormat(DEFAULT_LOCALE, {
            maximumFractionDigits: 1,
        }).format(absDiff)
    }

    return sign + formattedDiff
}
