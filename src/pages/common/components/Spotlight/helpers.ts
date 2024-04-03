import {Ticket} from 'models/ticket/types'
import {
    PickedTicket,
    TicketHighlights,
} from 'pages/common/components/Spotlight/SpotlightTicketRow'

export const ticketHighlightTransform = (
    item: Ticket | PickedTicket,
    highlight?: TicketHighlights
) => {
    if (highlight === undefined) {
        return {
            ...item,
            customer: {
                name: item.customer?.name || null,
                email: item.customer?.email || null,
                id: (item as PickedTicket).customer.id,
            },
            title: item.subject || item.excerpt || '',
            message: undefined,
        }
    }
    return {
        ...item,
        customer: Object.assign({}, item.customer, {
            id: (item as PickedTicket).customer.id,
            name:
                highlight['messages.from.name']?.[0] ??
                (item.customer?.name || null),
            email:
                highlight['messages.from.address']?.[0] ??
                (item.customer?.email || null),
        }),
        assignee_user: Object.assign({}, item.assignee_user, {
            name:
                highlight['messages.to.name']?.[0] ?? item.assignee_user?.name,
            email:
                highlight['messages.to.address']?.[0] ??
                item.assignee_user?.email,
        }),
        title: highlight.subject?.[0] || item.subject || '',
        message: highlight['messages.body']?.[0] || item.excerpt || '',
    }
}
