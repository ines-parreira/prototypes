import React from 'react'
import moment from 'moment'
import classnames from 'classnames'
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
            } {label}%
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

