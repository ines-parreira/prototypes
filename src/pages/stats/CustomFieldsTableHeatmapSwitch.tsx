import React from 'react'
import {useDispatch} from 'react-redux'
import useAppSelector from 'hooks/useAppSelector'
import * as ToggleButton from 'pages/common/components/ToggleButton'
import {
    getHeatmapMode,
    toggleHeatmapMode,
} from 'state/ui/stats/ticketInsightsSlice'

export const CustomFieldsTableHeatmapSwitch = () => {
    const heatmapMode = useAppSelector(getHeatmapMode)
    const dispatch = useDispatch()
    const toggleHandler = () => dispatch(toggleHeatmapMode())

    return (
        <ToggleButton.Wrapper
            type={ToggleButton.Type.Label}
            value={heatmapMode}
            onChange={toggleHandler}
            size={'small'}
        >
            <ToggleButton.Option value={false}>Table</ToggleButton.Option>
            <ToggleButton.Option value={true}>Heatmap</ToggleButton.Option>
        </ToggleButton.Wrapper>
    )
}
