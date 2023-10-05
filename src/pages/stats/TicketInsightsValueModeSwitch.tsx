import React, {useRef} from 'react'
import {useDispatch} from 'react-redux'
import useAppSelector from 'hooks/useAppSelector'
import * as ToggleButton from 'pages/common/components/ToggleButton'
import Tooltip from 'pages/common/components/Tooltip'
import {
    getValueMode,
    toggleValueMode,
    ValueMode,
} from 'state/ui/stats/ticketInsightsSlice'

const TOTAL_COUNT_TOOLTIP = 'Total count'
const PERCENTAGE_TOOLTIP = 'Percentage'
export const TOTAL_COUNT_LABEL = '#'
export const PERCENTAGE_LABEL = '%'

export const TicketInsightsValueModeSwitch = () => {
    const valueMode = useAppSelector(getValueMode)

    const dispatch = useDispatch()
    const toggleHandler = () => dispatch(toggleValueMode())

    const totalCountRef = useRef(null)
    const percentageRef = useRef(null)
    return (
        <ToggleButton.Wrapper
            type={ToggleButton.Type.Label}
            value={valueMode}
            onChange={toggleHandler}
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
