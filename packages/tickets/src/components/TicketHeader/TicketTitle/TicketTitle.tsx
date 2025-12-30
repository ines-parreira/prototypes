import { Link } from 'react-router-dom'

import { Breadcrumb, Breadcrumbs } from '@gorgias/axiom'
import type { Ticket } from '@gorgias/helpdesk-types'

import { getCustomerName } from '../../../helpers/getCustomerName'
import { EditableBreadcrumb } from '../../EditableBreadcrumb'
import { useTicketSubject } from './useTicketSubject'
import { useUpdateSubject } from './useUpdateSubject'

type TicketTitleProps = {
    ticket: Ticket
}

export function TicketTitle({ ticket }: TicketTitleProps) {
    const { subject, updateTicketTranslatedSubject } = useTicketSubject(ticket)
    const { updateSubject } = useUpdateSubject(ticket.id)

    /**
     * We keep them as separate function since in the legacy implementation
     * we still need the updateTicketTranslatedSubject to exist aside the
     * redux based BE + ticket update
     */
    const handleSubjectChange = (value: string) => {
        // BE + Ticket Update
        updateSubject(ticket.id, value)
        // Local cache updates for the DTP
        updateTicketTranslatedSubject(ticket.id, value)
    }

    return (
        <Breadcrumbs>
            <Breadcrumb>
                <Link to={`/app/customer/${ticket.customer.id}`}>
                    {getCustomerName(ticket.customer)}
                </Link>
            </Breadcrumb>
            <Breadcrumb asSlot>
                <EditableBreadcrumb
                    value={subject}
                    onChange={handleSubjectChange}
                />
            </Breadcrumb>
        </Breadcrumbs>
    )
}
