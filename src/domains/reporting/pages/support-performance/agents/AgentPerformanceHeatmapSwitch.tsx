import { TableHeatmapSwitch } from 'domains/reporting/pages/common/components/Table/TableHeatmapSwitch'
import {
    getHeatmapMode,
    toggleHeatmapMode,
} from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

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
