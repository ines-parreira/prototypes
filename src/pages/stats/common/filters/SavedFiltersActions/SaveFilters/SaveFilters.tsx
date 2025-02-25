import React from 'react'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import Button from 'pages/common/components/button/Button'

export const SAVE_FILTERS = 'Save Filters'
export const SAVE_FILTERS_ID = 'save-filters'
export const SAVE_FILTERS_TOOLTIP = 'Save applied filters to use later'

type Props = {
    onClick: () => void
    isDisabled?: boolean
}

export const SaveFilters = ({ onClick, isDisabled }: Props) => {
    return (
        <Button
            fillStyle="fill"
            intent="secondary"
            size="small"
            onClick={onClick}
            id={SAVE_FILTERS_ID}
            isDisabled={isDisabled}
            leadingIcon="tune"
        >
            {SAVE_FILTERS}
            <Tooltip target={SAVE_FILTERS_ID} placement="bottom">
                {SAVE_FILTERS_TOOLTIP}
            </Tooltip>
        </Button>
    )
}
