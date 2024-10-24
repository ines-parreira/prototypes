import classNames from 'classnames'
import React from 'react'

import Button from 'pages/common/components/button/Button'
import css from 'pages/stats/common/filters/SavedFiltersActions/SaveFilters/SaveFilters.less'

export const SAVE_FILTERS = 'Save Filters'

export const SaveFilters = ({
    isVisible,
    onClick,
}: {
    isVisible: boolean
    onClick: () => void
}) => {
    if (!isVisible) {
        return null
    }
    return (
        <Button
            fillStyle="fill"
            intent="secondary"
            size="medium"
            onClick={onClick}
        >
            <i className={classNames('material-icons', css.icon)}>tune</i>
            {SAVE_FILTERS}
        </Button>
    )
}
