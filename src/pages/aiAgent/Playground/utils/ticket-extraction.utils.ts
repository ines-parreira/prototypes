import { Ticket, TicketMessage } from '@gorgias/helpdesk-client'

import { PlaygroundCustomer } from '../types'

export type TicketExtractionResult = {
    customer: PlaygroundCustomer
    subject: string
    message: string
}

const onlyCustomerMessage = (message: TicketMessage) => {
    return !message.from_agent
}

export const extractTicketData = (ticket: Ticket): TicketExtractionResult => {
    // Extract customer data
    const customerName =
        ticket.customer?.name ||
        [ticket.customer?.firstname, ticket.customer?.lastname]
            .filter(Boolean)
            .join(' ') ||
        ''

    const customer: PlaygroundCustomer = {
        id: ticket.customer?.id ?? 0,
        email: ticket.customer?.email ?? '',
        name: customerName,
    }

    // Extract subject
    const subject = ticket.subject ?? ''

    // Extract first customer message
    const firstCustomerMessage = ticket.messages
        .filter(onlyCustomerMessage)
        .sort(
            (a, b) =>
                new Date(a.created_datetime).getTime() -
                new Date(b.created_datetime).getTime(),
        )[0]

    // Get message content - prefer stripped_text over body_text as it's cleaner
    // Convert line breaks to HTML breaks for proper display in Froala editor
    const rawMessage =
        firstCustomerMessage?.stripped_text ??
        firstCustomerMessage?.body_text ??
        ''

    const message = rawMessage.replace(/\n/g, '<br/>')

    return {
        customer,
        subject,
        message,
    }
}
