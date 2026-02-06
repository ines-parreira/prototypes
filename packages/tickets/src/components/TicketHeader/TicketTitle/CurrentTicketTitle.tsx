import type { Ticket } from '@gorgias/helpdesk-types'

import { getCustomerName } from '../../../helpers/getCustomerName'
import {
    TicketTitle,
    TicketTitleCustomer,
    TicketTitleSubject,
} from './TicketTitle'
import { useTicketSubject } from './useTicketSubject'
import { useUpdateSubject } from './useUpdateSubject'

type CurrentTicketTitleProps = {
    ticket: Ticket
}

export function CurrentTicketTitle({ ticket }: CurrentTicketTitleProps) {
    const { subject, updateTicketTranslatedSubject } = useTicketSubject(ticket)
    const { updateSubject } = useUpdateSubject(ticket.id)

    const handleSubjectChange = async (value: string) => {
        updateTicketTranslatedSubject(ticket.id, value)
        await updateSubject(ticket.id, value)
    }

    return (
        <TicketTitle>
            <TicketTitleCustomer
                customerName={getCustomerName(ticket.customer)}
                customerUrl={`/app/customer/${ticket.customer.id}`}
            />
            <TicketTitleSubject
                value={subject}
                onChange={handleSubjectChange}
            />
        </TicketTitle>
    )
}
