import {useContext, useMemo} from 'react'
import moment, {Moment} from 'moment'
import _isNumber from 'lodash/isNumber'
import {useSelector} from 'react-redux'

import {ViewFilter} from 'state/views/types'
import {getTicketViewField, getTicketViewFieldPath} from 'config/views'
import {ViewField} from 'models/view/types'
import {
    CollectionOperator,
    DatetimeOperator,
    EqualityOperator,
} from 'state/rules/types'
import {RootState} from 'state/types'

import StatsFiltersContext from '../StatsFiltersContext'

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

    return `Compared to : ${previousPeriod}`
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

    // For now, we don't store the country, an we'll use en-us
    return value.toLocaleString('en-us', {
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
    const duration = moment.duration(value, 'seconds')
    let response = ''
    let curPrecision = 0
    const months = duration.months()
    const days = duration.days()
    const hours = duration.hours()
    const minutes = duration.minutes()
    const seconds = duration.seconds()

    if (months) {
        response += `${months}mo `
        curPrecision++

        if (curPrecision >= precision) {
            return response
        }
    }

    if (days) {
        response += `${days}d `
        curPrecision++

        if (curPrecision >= precision) {
            return response
        }
    }

    if (hours) {
        response += `${hours}h `
        curPrecision++

        if (curPrecision >= precision) {
            return response
        }
    }

    if (minutes) {
        response += `${minutes}m `
        curPrecision++

        if (curPrecision >= precision) {
            return response
        }
    }

    if (seconds) {
        response += `${seconds}s`
    }

    return response
}

export const useStatsViewFilters = (periodFilterLeft: string): ViewFilter[] => {
    const statsFilters = useContext(StatsFiltersContext)
    const tagsState = useSelector((state: RootState) => state.entities.tags)
    return useMemo(() => {
        if (!statsFilters) {
            return []
        }

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
