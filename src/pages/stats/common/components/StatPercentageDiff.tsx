import React from 'react'
import _isNumber from 'lodash/isNumber'
import classNames from 'classnames'

import css from './StatPercentageDiff.less'

type Props = {
    label: string | number
    percentage: unknown
    moreIsBetter?: boolean
}

export default function StatPercentageDiff({
    label,
    percentage,
    moreIsBetter,
}: Props) {
    if (!_isNumber(percentage)) {
        return null
    }
    const icon =
        percentage > 0
            ? 'arrow_upward'
            : percentage < 0
            ? 'arrow_downward'
            : 'arrow_forward'
    const colorLabel =
        moreIsBetter == null
            ? ''
            : percentage === 0
            ? 'neutral'
            : (percentage > 0 && moreIsBetter) ||
              (percentage < 0 && !moreIsBetter)
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
            {label}%
        </span>
    )
}
