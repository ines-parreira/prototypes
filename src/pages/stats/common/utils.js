import React from 'react'
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

export const comparedPeriodString = (previousStartDatetime, previousEndDatetime) => {
    let previousPeriod = `${previousStartDatetime.format('MMM DD, YYYY')} - ${previousEndDatetime.format('MMM DD, YYYY')}`

    if (previousStartDatetime.isSame(previousEndDatetime, 'day')) {
        previousPeriod = previousStartDatetime.format('MMM DD, YYYY')
    }

    return `Compared to : ${previousPeriod}`
}
