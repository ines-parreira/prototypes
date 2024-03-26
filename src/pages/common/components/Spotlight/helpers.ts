import {Ticket} from 'models/ticket/types'
import {
    PickedTicket,
    TicketHighlights,
} from 'pages/common/components/Spotlight/SpotlightTicketRow'

export const ticketHighlightTransform = (
    highlight: TicketHighlights,
    item: Ticket | PickedTicket
) => ({
    ...item,
    customer: Object.assign({}, item.customer, {
        name:
            highlight['messages.from.name']?.[0] ??
            (item.customer?.name || null),
        email:
            highlight['messages.from.address']?.[0] ??
            (item.customer?.email || null),
    }),
    subject:
        highlight.subject?.[0] ??
        highlight['messages.body']?.[0] ??
        item.subject,
    assignee_user: Object.assign({}, item.assignee_user, {
        name: highlight['messages.to.name']?.[0] ?? item.assignee_user?.name,
        email:
            highlight['messages.to.address']?.[0] ?? item.assignee_user?.email,
    }),
})
