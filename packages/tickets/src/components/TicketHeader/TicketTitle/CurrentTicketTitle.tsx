import type { Ticket } from '@gorgias/helpdesk-types'

import { getCustomerName } from '../../../helpers/getCustomerName'
import { useTicketsLegacyBridge } from '../../../utils/LegacyBridge'
import {
    TicketTitle,
    TicketTitleCustomer,
    TicketTitleSubject,
    TicketTitleView,
} from './TicketTitle'
import { useTicketSubject } from './useTicketSubject'
import { useUpdateSubject } from './useUpdateSubject'

type CurrentTicketTitleProps = {
    ticket: Ticket
}

export function CurrentTicketTitle({ ticket }: CurrentTicketTitleProps) {
    const { subject, updateTicketTranslatedSubject } = useTicketSubject(ticket)
    const { updateSubject } = useUpdateSubject(ticket.id)
    const { dtpToggle, ticketViewBreadcrumb } = useTicketsLegacyBridge()

    const handleSubjectChange = async (value: string) => {
        updateTicketTranslatedSubject(ticket.id, value)
        await updateSubject(ticket.id, value)
    }

    return (
        <TicketTitle>
            {!dtpToggle.isEnabled && ticketViewBreadcrumb && (
                <TicketTitleView
                    viewName={ticketViewBreadcrumb.viewName}
                    viewUrl={`/app/tickets/${ticketViewBreadcrumb.viewId}`}
                />
            )}
            <TicketTitleCustomer
                customerName={getCustomerName(ticket.customer)}
                customerUrl={`/app/customer/${ticket.customer.id}`}
            />
            <TicketTitleSubject
                value={subject}
                placeholder="No ticket name"
                onChange={handleSubjectChange}
            />
        </TicketTitle>
    )
}
