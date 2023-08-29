import React from 'react'
import {useDispatch} from 'react-redux'
import useAppSelector from 'hooks/useAppSelector'
import * as ToggleButton from 'pages/common/components/ToggleButton'
import {
    selectHeatmapMode,
    toggleHeatmapMode,
} from 'state/ui/stats/agentPerformanceSlice'

export const HeatmapSwitch = () => {
    const heatmapMode = useAppSelector(selectHeatmapMode)
    const dispatch = useDispatch()
    const toggleHandler = () => dispatch(toggleHeatmapMode())

    return (
        <ToggleButton.Wrapper
            type={ToggleButton.Type.Label}
            value={heatmapMode}
            onChange={toggleHandler}
        >
            <ToggleButton.Option value={false}>Table</ToggleButton.Option>
            <ToggleButton.Option value={true}>Heatmap</ToggleButton.Option>
        </ToggleButton.Wrapper>
    )
}
