import React from 'react'

import {TicketMessageSourceType} from 'business/types/ticket'

import type {Notification} from '../types'
import Excerpt from './Excerpt'
import NotificationContent from './NotificationContent'
import type {ParentProps} from './NotificationContent'
import Subtitle from './Subtitle'

type Props = {
    notification: Notification
} & ParentProps

export default function DomainVerificationNotification({
    notification,
    ...props
}: Props) {
    if (!('domain' in notification.payload)) return null

    const {domain} = notification.payload

    return (
        <NotificationContent
            {...props}
            icon={{type: TicketMessageSourceType.SystemMessage}}
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
        </NotificationContent>
    )
}
