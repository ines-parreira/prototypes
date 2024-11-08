import {render} from '@testing-library/react'
import React from 'react'

import type {Notification} from 'common/notifications'

import type {EmailDomainPayload} from '../../types'
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
} as Notification<EmailDomainPayload>

describe('UserMentionedNotification', () => {
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
