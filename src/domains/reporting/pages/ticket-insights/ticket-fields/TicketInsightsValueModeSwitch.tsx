import { TableValueModeSwitch } from 'domains/reporting/pages/common/components/Table/TableValueModeSwitch'
import {
    getValueMode,
    toggleValueMode,
} from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

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
