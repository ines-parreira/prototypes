import moment from 'moment'
import _isNumber from 'lodash/isNumber'
import {Moment} from 'moment/moment'
import {List, Map} from 'immutable'

import {ViewFilter} from '../../../state/views/types'
import {getTicketViewField, getTicketViewFieldPath} from '../../../config/views'
import {ViewField} from '../../../models/view/types'
import {
    CollectionOperator,
    DatetimeOperator,
    EqualityOperator,
} from '../../../state/rules/types'

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

export const getStatsViewFilters = (
    periodFilterLeft: string,
    statsFilters: Maybe<Map<any, any>>
): ViewFilter[] => {
    const filters: ViewFilter[] = []

    if (statsFilters?.has('period')) {
        filters.push({
            left: periodFilterLeft,
            operator: DatetimeOperator.GTE,
            // TODO: remove .utc() after https://linear.app/gorgias/issue/COR-529/display-view-date-filters-in-the-user-timezone
            right: `'${moment(statsFilters.getIn(['period', 'start_datetime']))
                .utc()
                .format()}'`,
        })
        filters.push({
            left: periodFilterLeft,
            operator: DatetimeOperator.LTE,
            // TODO: remove .utc() after https://linear.app/gorgias/issue/COR-529/display-view-date-filters-in-the-user-timezone
            right: `'${moment(statsFilters.getIn(['period', 'end_datetime']))
                .utc()
                .format()}'`,
        })
    }

    if (statsFilters?.has('channels')) {
        const filtersList = statsFilters?.get('channels') as List<any>
        filters.push({
            left: getTicketViewFieldPath(getTicketViewField(ViewField.Channel)),
            operator:
                filtersList.size > 1
                    ? CollectionOperator.ContainsAny
                    : EqualityOperator.Eq,
            right: JSON.stringify(
                filtersList.size > 1 ? filtersList.toJS() : filtersList.first()
            ),
        })
    }

    if (statsFilters?.has('integrations')) {
        const filtersList = statsFilters?.get('integrations') as List<any>
        filters.push({
            left: getTicketViewFieldPath(
                getTicketViewField(ViewField.Integrations)
            ),
            operator:
                filtersList.size > 1
                    ? CollectionOperator.ContainsAny
                    : EqualityOperator.Eq,
            right: JSON.stringify(
                filtersList.size > 1 ? filtersList.toJS() : filtersList.first()
            ),
        })
    }

    if (statsFilters?.has('agents')) {
        const filtersList = statsFilters?.get('agents') as List<number>
        filters.push({
            left: getTicketViewFieldPath(
                getTicketViewField(ViewField.Assignee)
            ),
            operator:
                filtersList.size > 1
                    ? CollectionOperator.ContainsAny
                    : EqualityOperator.Eq,
            right: JSON.stringify(
                filtersList.size > 1 ? filtersList.toJS() : filtersList.first()
            ),
        })
    }

    return filters
}
