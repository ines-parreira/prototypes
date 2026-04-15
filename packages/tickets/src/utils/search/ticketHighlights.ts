import type {
    TicketHighlightDataItemHighlightsMessagesFrom,
    TicketHighlightDataItemHighlightsMessagesTo,
} from '@gorgias/helpdesk-types'

import type { SearchTicket } from '../../ticket-list/types/search'

const getCustomerHighlight = (
    ticket: SearchTicket,
    sender?: TicketHighlightDataItemHighlightsMessagesFrom,
    recipient?: TicketHighlightDataItemHighlightsMessagesTo,
) => {
    const highlightedSenderName = sender?.name?.[0]
    if (highlightedSenderName) {
        return highlightedSenderName
    }

    const highlightedSenderAddress = sender?.address?.[0]
    if (highlightedSenderAddress) {
        return highlightedSenderAddress
    }

    const highlightedRecipient = recipient?.address?.[0]
    if (highlightedRecipient) {
        return highlightedRecipient
    }

    return (
        ticket.customer?.name ||
        ticket.customer?.email ||
        `Customer #${ticket.customer?.id ?? ticket.id}`
    )
}

export function getTicketSearchDisplayData(ticket: SearchTicket) {
    const highlights = ticket.highlights

    return {
        customer: getCustomerHighlight(
            ticket,
            highlights?.messages?.from,
            highlights?.messages?.to,
        ),
        subject: highlights?.subject?.[0] ?? ticket.subject ?? '',
        excerpt: highlights?.messages?.body?.[0] ?? ticket.excerpt ?? '',
        ticketId: highlights?.id?.[0]
            ? `Ticket ID: ${highlights.id[0]}`
            : String(ticket.id),
    }
}
