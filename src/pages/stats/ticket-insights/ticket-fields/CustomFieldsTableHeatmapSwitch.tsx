import React from 'react'
// eslint-disable-next-line no-restricted-imports
import {useDispatch} from 'react-redux'

import useAppSelector from 'hooks/useAppSelector'
import {TableHeatmapSwitch} from 'pages/stats/common/components/Table/TableHeatmapSwitch'
import {
    getHeatmapMode,
    toggleHeatmapMode,
} from 'state/ui/stats/ticketInsightsSlice'

export const CustomFieldsTableHeatmapSwitch = () => {
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
