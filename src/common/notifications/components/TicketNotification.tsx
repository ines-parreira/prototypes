import React from 'react'

import {Notification} from '../types'
import Excerpt from './Excerpt'
import NotificationContent from './NotificationContent'
import type {ParentProps} from './NotificationContent'
import Subject from './Subject'
import Subtitle from './Subtitle'

type Props = {
    notification: Notification
} & ParentProps

const subIcons: Record<string, ParentProps['subIcon']> = {
    'ticket.assigned': {family: 'fill', name: 'person'},
    'ticket.snooze-expired': {name: 'snooze'},
}

const titleOverrides: Record<string, string> = {
    'ticket.assigned': 'You’ve been assigned to a ticket',
    'ticket.snooze-expired': 'Snooze expired',
}

export default function TicketNotification({notification, ...props}: Props) {
    if (!('ticket' in notification.payload)) return null

    const {sender, ticket} = notification.payload

    return (
        <NotificationContent
            {...props}
            icon={{status: ticket.status, type: ticket.channel}}
            subIcon={subIcons[notification.type]}
            title={titleOverrides[notification.type] || 'New message'}
            url={`/app/ticket/${ticket.id}`}
        >
            <Subtitle>
                <Subject>{ticket.subject}</Subject>
                {!!sender && (
                    <>
                        {' '}
                        from <strong>{sender.name}</strong>
                    </>
                )}
            </Subtitle>
            {!!ticket.excerpt && <Excerpt>{ticket.excerpt}</Excerpt>}
        </NotificationContent>
    )
}
