import React from 'react'
import classnames from 'classnames'
import moment from 'moment'
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
        <span
            className={classnames('stats-difference', {
                positive: colorLabel && isPositive,
                negative: colorLabel && !isPositive
            })}
        >
            {
                percentage !== 0
                && (
                    <i
                        className={classnames('icon arrow', {
                            up: percentage > 0,
                            down: percentage < 0
                        })}
                    />
                )
            } {percentage}%
        </span>
    )
}

/**
 * Return a start and an end time according to passed period string
 * ex: 'last-week' will return the start and the end of last week period
 * @param period
 * @returns {{startDatetime: *, endDatetime: *}}
 */
export const timesFromPeriod = (period) => {
    let startDatetime = moment()
    let endDatetime = moment()

    if (period === 'last-7-days') {
        startDatetime = startDatetime.subtract(1, 'week')
        endDatetime = endDatetime.subtract(1, 'day')
    }

    if (period === 'past-week') {
        startDatetime = startDatetime.subtract(1, 'week').startOf('week')
        endDatetime = endDatetime.subtract(1, 'week').endOf('week')
    }

    if (period === 'last-month') {
        startDatetime = startDatetime.subtract(1, 'month')
        endDatetime = endDatetime.subtract(1, 'day')
    }

    if (period === 'past-month') {
        startDatetime = startDatetime.subtract(1, 'month').startOf('month')
        endDatetime = endDatetime.subtract(1, 'month').endOf('month')
    }

    if (period === 'last-3-months') {
        startDatetime = startDatetime.subtract(3, 'month')
        endDatetime = endDatetime.subtract(1, 'day')
    }

    if (period === 'last-6-months') {
        startDatetime = startDatetime.subtract(5, 'month')
        endDatetime = endDatetime.subtract(1, 'day')
    }

    if (period === 'last-year') {
        startDatetime = startDatetime.subtract(1, 'year')
        endDatetime = endDatetime.subtract(1, 'day')
    }

    return {
        startDatetime,
        endDatetime,
    }
}

export const comparedPeriodString = (previousStartDatetime, previousEndDatetime) => {
    let previousPeriod = `${previousStartDatetime.format('MMM DD, YYYY')} - ${previousEndDatetime.format('MMM DD, YYYY')}`

    if (previousStartDatetime.isSame(previousEndDatetime, 'day')) {
        previousPeriod = previousStartDatetime.format('MMM DD, YYYY')
    }

    return `Compared to : ${previousPeriod}`
}
