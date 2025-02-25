import React from 'react'

import { TicketMessageSourceType } from 'business/types/ticket'
import { Content, Excerpt, Subtitle } from 'common/notifications'
import type { ContentProps, Notification } from 'common/notifications'

import type { EmailDomainPayload } from '../types'

type Props = {
    notification: Notification<EmailDomainPayload>
} & ContentProps

export default function DomainVerificationNotification({
    notification,
    ...props
}: Props) {
    const { domain } = notification.payload

    return (
        <Content
            {...props}
            icon={{ type: TicketMessageSourceType.SystemMessage }}
            title="Domain verification complete"
            url="/app/settings/channels/email"
        >
            <Subtitle>
                <strong>System update</strong> from <strong>Gorgias</strong>
            </Subtitle>
            <Excerpt>
                Your domain has been verified! You can now send emails with
                Gorgias using addresses ending in @{domain}.
            </Excerpt>
        </Content>
    )
}
