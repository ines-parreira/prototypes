import {Tooltip} from '@gorgias/ui-kit'
import React, {useRef} from 'react'

import * as ToggleButton from 'pages/common/components/ToggleButton'

import {ValueMode} from 'state/ui/stats/types'

const TOTAL_COUNT_TOOLTIP = 'Total count'
const PERCENTAGE_TOOLTIP = 'Percentage'
export const TOTAL_COUNT_LABEL = '#'
export const PERCENTAGE_LABEL = '%'

export const TableValueModeSwitch = ({
    toggleValueMode,
    valueMode,
}: {
    toggleValueMode: () => void
    valueMode: ValueMode
}) => {
    const totalCountRef = useRef(null)
    const percentageRef = useRef(null)
    return (
        <ToggleButton.Wrapper
            type={ToggleButton.Type.Label}
            value={valueMode}
            onChange={toggleValueMode}
            size={'small'}
        >
            <ToggleButton.Option value={ValueMode.TotalCount}>
                <span ref={totalCountRef}>{TOTAL_COUNT_LABEL}</span>
                <Tooltip target={totalCountRef}>{TOTAL_COUNT_TOOLTIP}</Tooltip>
            </ToggleButton.Option>
            <ToggleButton.Option value={ValueMode.Percentage}>
                <span ref={percentageRef}>{PERCENTAGE_LABEL}</span>
                <Tooltip target={percentageRef}>{PERCENTAGE_TOOLTIP}</Tooltip>
            </ToggleButton.Option>
        </ToggleButton.Wrapper>
    )
}
