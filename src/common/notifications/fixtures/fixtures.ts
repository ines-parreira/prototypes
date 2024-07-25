import {TicketChannel, TicketStatus} from 'business/types/ticket'

import {Notification} from '../types'

const baseNotification = {
    id: '1',
    inserted_datetime: '2021-09-01T00:00:00Z',
    read_datetime: null,
    seen_datetime: null,
}

export const notification: Notification = {
    ...baseNotification,
    type: 'ticket-message.created',
    payload: {
        ticket: {
            id: 1,
            channel: TicketChannel.Email,
            status: TicketStatus.Open,
            subject: 'Test ticket',
            excerpt: 'Excerpt',
        },
        sender: {
            id: 1,
            name: 'John Doe',
            firstname: 'John',
            lastname: 'Doe',
        },
    },
}

export const mentionNotification: Notification = {
    ...notification,
    type: 'user.mentioned',
}
