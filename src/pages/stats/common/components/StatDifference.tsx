import React from 'react'
import _isNumber from 'lodash/isNumber'
import classNames from 'classnames'

import css from './StatDifference.less'

type Props = {
    label: string | number
    value: unknown
    moreIsBetter?: boolean
    isPercentage?: boolean
}

export default function StatDifference({
    label,
    value,
    moreIsBetter,
    isPercentage = true,
}: Props) {
    if (!_isNumber(value)) {
        return null
    }
    const icon =
        value > 0
            ? 'arrow_upward'
            : value < 0
            ? 'arrow_downward'
            : 'arrow_forward'
    const colorLabel =
        moreIsBetter == null
            ? ''
            : value === 0
            ? 'neutral'
            : (value > 0 && moreIsBetter) || (value < 0 && !moreIsBetter)
            ? 'positive'
            : 'negative'
    return (
        <span>
            <i
                className={classNames(
                    'material-icons mr-1',
                    css.statsDifference,
                    css[colorLabel]
                )}
            >
                {icon}
            </i>
            {label}
            {isPercentage && '%'}
        </span>
    )
}
