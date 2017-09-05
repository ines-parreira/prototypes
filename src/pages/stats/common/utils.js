import React from 'react'
import moment from 'moment'
import classnames from 'classnames'
import _isUndefined from 'lodash/isUndefined'
import _isNumber from 'lodash/isNumber'

/**
 * Render a difference (between two values, passed as percentage) showing if it increases or decreases
 * @param percentage
 * @param moreIsBetter {boolean} (optional) - if passed, color the label in green or red accordingly
 * @returns {*}
 */
export const renderDifference = (percentage, moreIsBetter) => {
    if (!_isNumber(percentage)) {
        return null
    }

    let isPositive = percentage > 0
    const colorLabel = !_isUndefined(moreIsBetter)

    if (!moreIsBetter) {
        isPositive = !isPositive
    }

    return (
        <div
            className={classnames('stats-difference', {
                positive: colorLabel && isPositive,
                negative: colorLabel && !isPositive
            })}
        >
            {
                percentage !== 0
                && (
                    <i
                        className={classnames('fa fa-fw', {
                            'fa-arrow-up': percentage > 0,
                            'fa-arrow-down': percentage < 0
                        })}
                    />
                )
            } {percentage}%
        </div>
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

// format a value and display it as a duration (days, hours, minutes or seconds)
export const formatDuration = (value) => {
    const duration = moment.duration(value, 'seconds')
    let response = ''

    const days = duration.days()
    const hours = duration.hours()
    const minutes = duration.minutes()
    const seconds = duration.seconds()

    if (days) {
        response += `${days}d `
    }

    if (hours) {
        response += `${hours}h `
    }

    if (minutes) {
        response += `${minutes}m `
    }

    if (seconds) {
        response += `${seconds}s`
    }

    return response
}

