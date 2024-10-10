import React from 'react'
import useAppDispatch from 'hooks/useAppDispatch'
import {TableValueModeSwitch} from 'pages/stats/common/components/Table/TableValueModeSwitch'
import useAppSelector from 'hooks/useAppSelector'
import {getValueMode, toggleValueMode} from 'state/ui/stats/ticketInsightsSlice'

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
