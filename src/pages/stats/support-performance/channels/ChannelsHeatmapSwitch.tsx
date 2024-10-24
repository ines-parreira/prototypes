import React from 'react'
import {useDispatch} from 'react-redux'

import useAppSelector from 'hooks/useAppSelector'
import {TableHeatmapSwitch} from 'pages/stats/common/components/Table/TableHeatmapSwitch'
import {getHeatmapMode, toggleHeatmapMode} from 'state/ui/stats/channelsSlice'

export const ChannelsHeatmapSwitch = () => {
    const isHeatmapMode = useAppSelector(getHeatmapMode)
    const dispatch = useDispatch()
    const toggleHandler = () => dispatch(toggleHeatmapMode())

    return (
        <TableHeatmapSwitch
            isHeatmapMode={isHeatmapMode}
            toggleHandler={toggleHandler}
        />
    )
}
