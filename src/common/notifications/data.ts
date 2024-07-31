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
        label: "A new message arrives in a ticket I'm assigned to",
    },
    {
        enabled: true,
        type: 'user.mentioned',
        label: 'I am mentioned in an internal note',
    },
    {
        enabled: true,
        type: 'ticket.snooze-expired',
        label: "A conversation snooze expires in a ticket I'm assigned to",
    },
    {
        enabled: true,
        type: 'ticket.assigned',
        label: 'I’m assigned to a ticket',
    },
]

export const enabledEvents = events.filter((event) => event.enabled)

export const workflowMap: Record<NotificationType, string> = {
    'ticket.snooze-expired': 'ticket-snooze-expired',
    'ticket-message.created': 'ticket-message-created',
    'user.mentioned': 'user-mentioned',
    'ticket.assigned': 'ticket-assigned',
}
