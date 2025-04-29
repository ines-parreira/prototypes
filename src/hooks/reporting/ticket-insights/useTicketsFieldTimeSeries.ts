import {
    Entity,
    useTicketTimeReference,
} from 'hooks/reporting/ticket-insights/useTicketTimeReference'
import { useCustomFieldsTimeSeries } from 'hooks/reporting/useCustomFieldsTimeSeries'
import useAppSelector from 'hooks/useAppSelector'
import { getSelectedCustomField } from 'state/ui/stats/ticketInsightsSlice'

export const useTicketsFieldTimeSeries = () => {
    const selectedCustomField = useAppSelector(getSelectedCustomField)

    const [ticketFieldsTicketTimeReference] = useTicketTimeReference(
        Entity.TicketField,
    )

    return useCustomFieldsTimeSeries({
        selectedCustomFieldId: selectedCustomField.id,
        ticketFieldsTicketTimeReference,
    })
}
