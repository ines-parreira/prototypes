import React from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { TableValueModeSwitch } from 'pages/stats/common/components/Table/TableValueModeSwitch'
import {
    getValueMode,
    toggleValueMode,
} from 'state/ui/stats/ticketInsightsSlice'

export const TicketInsightsValueModeSwitch = () => {
    const valueMode = useAppSelector(getValueMode)

    const dispatch = useAppDispatch()

    const toggleHandler = () => dispatch(toggleValueMode())

    return (
        <TableValueModeSwitch
            valueMode={valueMode}
            toggleValueMode={toggleHandler}
        />
    )
}
