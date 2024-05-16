import React from 'react'

import type {Channel, Event, NotificationType} from './types'

export const channels: Channel[] = [
    {
        type: 'in_app_feed',
        label: 'Browser',
    },
]

export const events: Event[] = [
    {
        enabled: true,
        type: 'ticket-message.created',
        label: "New messages from all channels & when I'm assigned to a ticket",
    },
    {
        enabled: true,
        type: 'user.mentioned',
        label: 'I am mentioned in an internal note',
    },
    {
        enabled: false,
        type: 'ticket.snooze-expired',
        label: (
            <>
                A conversation <strong>snooze expires</strong> in a{' '}
                <strong>ticket I'm assigned to</strong>
            </>
        ),
    },
]

export const workflowMap: Record<NotificationType, string> = {
    'ticket.snooze-expired': 'ticket-snooze-expired',
    'ticket-message.created': 'ticket-message-created',
    'user.mentioned': 'user-mentioned',
}
