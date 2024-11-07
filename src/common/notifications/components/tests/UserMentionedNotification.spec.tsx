import {render} from '@testing-library/react'
import React from 'react'

import {TicketChannel, TicketStatus} from 'business/types/ticket'

import type {Notification} from '../../types'
import UserMentionedNotification from '../UserMentionedNotification'

const notification = {
    type: 'user.mentioned',
    payload: {
        sender: {
            id: 456,
            name: 'John Doe',
            firstName: 'John',
            lastName: 'Doe',
        },
        ticket: {
            id: 123,
            channel: TicketChannel.Email,
            excerpt: 'Magical ticket excerpt',
            sender: {
                id: 457,
                name: 'Jane Doe',
                firstName: 'Jane',
                lastName: 'Doe',
            },
            status: TicketStatus.Open,
            subject: 'Awesome ticket subject',
        },
    },
} as unknown as Notification

describe('UserMentionedNotification', () => {
    it('should return null if an invalid notification is sent', () => {
        const {container} = render(
            <UserMentionedNotification
                notification={{type: 'ticket-message.created'} as Notification}
            />
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('should render the notification with a sender', () => {
        const {getByText} = render(
            <UserMentionedNotification notification={notification} />
        )
        expect(getByText('New mention')).toBeInTheDocument()
        expect(
            getByText(
                (_, el) =>
                    el?.textContent ===
                    'John Doe mentioned you in Awesome ticket subject'
            )
        ).toBeInTheDocument()
        expect(getByText('Magical ticket excerpt')).toBeInTheDocument()
    })

    it('should render the notification without a sender', () => {
        const {getByText} = render(
            <UserMentionedNotification
                notification={
                    {
                        ...notification,
                        payload: {...notification.payload, sender: undefined},
                    } as Notification
                }
            />
        )
        expect(getByText('New mention')).toBeInTheDocument()
        expect(
            getByText(
                (_, el) =>
                    el?.textContent ===
                    'You were mentioned in Awesome ticket subject'
            )
        ).toBeInTheDocument()
        expect(getByText('Magical ticket excerpt')).toBeInTheDocument()
    })
})
