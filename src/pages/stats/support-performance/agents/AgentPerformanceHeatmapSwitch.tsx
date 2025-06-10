import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { TableHeatmapSwitch } from 'pages/stats/common/components/Table/TableHeatmapSwitch'
import {
    getHeatmapMode,
    toggleHeatmapMode,
} from 'state/ui/stats/agentPerformanceSlice'

export const AgentPerformanceHeatmapSwitch = () => {
    const heatmapMode = useAppSelector(getHeatmapMode)
    const dispatch = useAppDispatch()
    const toggleHandler = () => dispatch(toggleHeatmapMode())

    return (
        <TableHeatmapSwitch
            isHeatmapMode={heatmapMode}
            toggleHandler={toggleHandler}
        />
    )
}
