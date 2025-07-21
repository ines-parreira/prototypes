import { TableHeatmapSwitch } from 'domains/reporting/pages/common/components/Table/TableHeatmapSwitch'
import {
    getHeatmapMode,
    toggleHeatmapMode,
} from 'domains/reporting/state/ui/stats/channelsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

export const ChannelsHeatmapSwitch = () => {
    const isHeatmapMode = useAppSelector(getHeatmapMode)
    const dispatch = useAppDispatch()
    const toggleHandler = () => dispatch(toggleHeatmapMode())

    return (
        <TableHeatmapSwitch
            isHeatmapMode={isHeatmapMode}
            toggleHandler={toggleHandler}
        />
    )
}
