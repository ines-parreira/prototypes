import {
    Entity,
    useTicketTimeReference,
} from 'domains/reporting/hooks/ticket-insights/useTicketTimeReference'
import { useCustomFieldsTimeSeries } from 'domains/reporting/hooks/useCustomFieldsTimeSeries'

export const useTicketsFieldTimeSeries = (selectedCustomFieldId: number) => {
    const [ticketFieldsTicketTimeReference] = useTicketTimeReference(
        Entity.TicketField,
    )

    return useCustomFieldsTimeSeries({
        selectedCustomFieldId: selectedCustomFieldId,
        ticketFieldsTicketTimeReference,
    })
}
