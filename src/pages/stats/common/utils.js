import moment from 'moment'
import _isNumber from 'lodash/isNumber'

export const comparedPeriodString = (
    previousStartDatetime,
    previousEndDatetime
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
export const formatPercent = (value) => {
    return _isNumber(value) ? `${value}%` : ''
}

// format a value and display it as a currency
export const formatCurrency = (value, currency) => {
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

 * @param value a duration in seconds
 * @param precision Number of unit to display
 * @returns {string}
 */
export const formatDuration = (value, precision = 9) => {
    const duration = moment.duration(value, 'seconds')
    let response = ''
    let curPrecision = 0
    const days = duration.days()
    const hours = duration.hours()
    const minutes = duration.minutes()
    const seconds = duration.seconds()

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
