import {render} from '@testing-library/react'
import React from 'react'

import {TicketChannel, TicketStatus} from 'business/types/ticket'
import type {Notification} from 'common/notifications'

import type {TicketPayload} from '../../types'
import TicketNotification from '../TicketNotification'

const notification: Notification<TicketPayload> = {
    id: '1',
    inserted_datetime: '2021-09-01T00:00:00Z',
    read_datetime: null,
    seen_datetime: null,
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

describe('<TicketNotification />', () => {
    it('should render notification content', () => {
        const {getByText} = render(
            <TicketNotification
                notification={notification}
                headerExtra="extra"
            />
        )

        expect(getByText('New message')).toBeInTheDocument()
        expect(getByText('extra')).toBeInTheDocument()
        expect(getByText('Excerpt')).toBeInTheDocument()
    })

    it('should render regular notification icon', () => {
        const {getByText} = render(
            <TicketNotification
                notification={{
                    ...notification,
                    payload: {
                        ticket: notification.payload.ticket,
                    },
                    type: 'ticket.assigned',
                }}
            />
        )

        expect(getByText('person')).toBeInTheDocument()
        expect(getByText('person')).toHaveClass('material-icons')
    })
})
