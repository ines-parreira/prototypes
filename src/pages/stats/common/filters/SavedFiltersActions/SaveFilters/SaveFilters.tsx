import {Tooltip} from '@gorgias/merchant-ui-kit'
import classNames from 'classnames'
import React from 'react'

import Button from 'pages/common/components/button/Button'
import css from 'pages/stats/common/filters/SavedFiltersActions/SaveFilters/SaveFilters.less'

export const SAVE_FILTERS = 'Save Filters'
export const SAVE_FILTERS_ID = 'save-filters'
export const SAVE_FILTERS_TOOLTIP = 'Save applied filters to use later'

type Props = {
    onClick: () => void
    isDisabled?: boolean
}

export const SaveFilters = ({onClick, isDisabled}: Props) => {
    return (
        <Button
            fillStyle="fill"
            intent="secondary"
            size="medium"
            onClick={onClick}
            id={SAVE_FILTERS_ID}
            isDisabled={isDisabled}
        >
            <i className={classNames('material-icons', css.icon)}>tune</i>
            {SAVE_FILTERS}
            <Tooltip target={SAVE_FILTERS_ID} placement="bottom">
                {SAVE_FILTERS_TOOLTIP}
            </Tooltip>
        </Button>
    )
}
