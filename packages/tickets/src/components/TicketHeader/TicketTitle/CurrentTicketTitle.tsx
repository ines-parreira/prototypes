import { useActiveView } from '@repo/views'

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
    const activeView = useActiveView()
    const activeViewId =
        typeof activeView?.id === 'number' ? activeView.id : undefined
    const activeViewName =
        typeof activeView?.name === 'string' ? activeView.name : undefined
    const {
        dtpToggle,
        ticketViewNavigation: { isSearchView = false, shouldDisplay = false },
    } = useTicketsLegacyBridge()
    const shouldShowViewBreadcrumb =
        !dtpToggle.isEnabled &&
        shouldDisplay &&
        !isSearchView &&
        activeViewId !== undefined &&
        activeViewName !== undefined

    const handleSubjectChange = async (value: string) => {
        updateTicketTranslatedSubject(ticket.id, value)
        await updateSubject(ticket.id, value)
    }

    return (
        <TicketTitle>
            {shouldShowViewBreadcrumb && (
                <TicketTitleView
                    viewName={activeViewName}
                    viewUrl={`/app/tickets/${activeViewId}`}
                />
            )}
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
