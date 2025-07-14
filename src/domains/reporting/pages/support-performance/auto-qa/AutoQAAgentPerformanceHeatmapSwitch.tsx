import { TableHeatmapSwitch } from 'domains/reporting/pages/common/components/Table/TableHeatmapSwitch'
import {
    getHeatmapMode,
    toggleHeatmapMode,
} from 'domains/reporting/state/ui/stats/autoQAAgentPerformanceSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

export const AutoQAAgentPerformanceHeatmapSwitch = () => {
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
