import React from 'react'
import moment from 'moment'
import _isUndefined from 'lodash/isUndefined'
import _isNumber from 'lodash/isNumber'

/**
 * Render a difference (between two values, passed as percentage) showing if it increases or decreases
 * @param label {Integer|String|JSX} value displayed
 * @param percentage {Integer} value used to determine direction of the arrow (up or down)
 * @param moreIsBetter {boolean} (optional) - if passed, color the label in green or red accordingly
 * @returns {*}
 */
export const renderDifference = (label, percentage, moreIsBetter) => {
    if (!_isNumber(percentage)) {
        return null
    }

    const isIncreasing = percentage > 0
    const isDecreasing  = percentage < 0
    const isEqual = percentage === 0
    let icon = 'arrow_forward'
    let colorLabel = ''

    if (!_isUndefined(moreIsBetter)) {
        if (isEqual) {
            colorLabel = 'neutral'
        } else if ((isIncreasing && moreIsBetter) || (isDecreasing && !moreIsBetter)) {
            colorLabel = 'positive'
        } else {
            colorLabel = 'negative'
        }

    }

    if (isIncreasing) {
        icon = 'arrow_upward'
    } else if (isDecreasing) {
        icon = 'arrow_downward'
    }

    return (
        <span>
            <i
                className={`stats-difference ${colorLabel} material-icons font-weight-bold mr-1`}
                style={{fontSize: '15px'}}
            >
                {icon}
            </i>
            {label}%
        </span>
    )
}

export const comparedPeriodString = (previousStartDatetime, previousEndDatetime) => {
    let previousPeriod = `${previousStartDatetime.format('MMM DD, YYYY')} - ${previousEndDatetime.format('MMM DD, YYYY')}`

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
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
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

