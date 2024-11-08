import {render} from '@testing-library/react'
import React from 'react'

import type {Notification} from 'common/notifications'

import DomainVerificationNotification from '../DomainVerificationNotification'

const notification = {
    id: '1',
    inserted_datetime: '2024-11-04T13:07:00',
    read_datetime: null,
    seen_datetime: null,
    type: 'user.mentioned',
    payload: {
        domain: 'example.com',
    },
} as unknown as Notification

describe('UserMentionedNotification', () => {
    it('should return null if an invalid notification is sent', () => {
        const {container} = render(
            <DomainVerificationNotification
                notification={
                    {
                        type: 'ticket-message.created',
                        payload: {},
                    } as Notification
                }
            />
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('should render the notification with a sender', () => {
        const {getByText} = render(
            <DomainVerificationNotification notification={notification} />
        )
        expect(getByText('Domain verification complete')).toBeInTheDocument()
        expect(
            getByText(
                (_, el) => el?.textContent === 'System update from Gorgias'
            )
        ).toBeInTheDocument()
        expect(
            getByText(
                'Your domain has been verified! You can now send emails with Gorgias using addresses ending in @example.com.'
            )
        ).toBeInTheDocument()
    })
})
