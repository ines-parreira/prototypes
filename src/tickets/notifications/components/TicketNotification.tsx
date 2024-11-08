import React from 'react'

import {Content, Excerpt, Subject, Subtitle} from 'common/notifications'
import type {ContentProps, Notification} from 'common/notifications'

import type {TicketPayload} from '../types'

type Props = {
    notification: Notification<TicketPayload>
} & ContentProps

const subIcons: Record<string, ContentProps['subIcon']> = {
    'ticket.assigned': {family: 'fill', name: 'person'},
    'ticket.snooze-expired': {name: 'snooze'},
}

const titleOverrides: Record<string, string> = {
    'ticket.assigned': 'You’ve been assigned to a ticket',
    'ticket.snooze-expired': 'Snooze expired',
}

export default function TicketNotification({notification, ...props}: Props) {
    const {sender, ticket} = notification.payload

    return (
        <Content
            {...props}
            icon={{status: ticket.status, type: ticket.channel}}
            subIcon={subIcons[notification.type]}
            title={titleOverrides[notification.type] || 'New message'}
            url={`/app/ticket/${ticket.id}`}
        >
            <Subtitle>
                {/* the extra space here is intentional */}
                <Subject>{ticket.subject} </Subject>
                {!!sender?.name && (
                    <>
                        {' '}
                        from <strong>{sender.name}</strong>
                    </>
                )}
            </Subtitle>
            {!!ticket.excerpt && <Excerpt>{ticket.excerpt}</Excerpt>}
        </Content>
    )
}
