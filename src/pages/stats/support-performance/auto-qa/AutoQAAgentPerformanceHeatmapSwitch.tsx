import React from 'react'
import {useDispatch} from 'react-redux'
import {TableHeatmapSwitch} from 'pages/stats/common/components/Table/TableHeatmapSwitch'
import useAppSelector from 'hooks/useAppSelector'
import {
    getHeatmapMode,
    toggleHeatmapMode,
} from 'state/ui/stats/autoQAAgentPerformanceSlice'

export const AutoQAAgentPerformanceHeatmapSwitch = () => {
    const heatmapMode = useAppSelector(getHeatmapMode)
    const dispatch = useDispatch()
    const toggleHandler = () => dispatch(toggleHeatmapMode())

    return (
        <TableHeatmapSwitch
            isHeatmapMode={heatmapMode}
            toggleHandler={toggleHandler}
        />
    )
}
