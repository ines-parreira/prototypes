import DomainVerificationNotification from './components/DomainVerificationNotification'
import TicketNotification from './components/TicketNotification'
import UserMentionedNotification from './components/UserMentionedNotification'

import {CategoryConfig, Channel, NotificationConfig} from './types'

export const channels: Channel[] = [
    {
        type: 'in_app_feed',
        label: 'Browser',
    },
]

export const categories: CategoryConfig[] = [
    {
        type: 'ticket-updates',
        label: 'Ticket updates',
        description: 'Get notified when one of these events happen:',
        typeLabel: 'Event',
        notifications: [
            'legacy-chat-and-messaging',
            'user.mentioned',
            'ticket.snooze-expired',
            'ticket.assigned',
        ],
    },
    {
        type: 'ticket-message-created',
        label: 'New messages',
        description:
            'Get notified when you receive new messages from these channels.',
        typeLabel: 'Message channel',
        notifications: [
            'ticket-message.created.email',
            'ticket-message.created.chat',
            'ticket-message.created.phone',
            'ticket-message.created.sms',
            'ticket-message.created.facebook',
            'ticket-message.created.instagram',
            'ticket-message.created.whatsapp',
            'ticket-message.created.yotpo',
            'ticket-message.created.aircall',
            'ticket-message.created',
        ],
    },
]

export const notifications: Record<string, NotificationConfig> = {
    'legacy-chat-and-messaging': {
        type: 'legacy-chat-and-messaging',
        component: TicketNotification,
        workflow: '',
        settings: {
            label: 'Chat & messaging tickets',
        },
    },
    'user.mentioned': {
        type: 'user.mentioned',
        component: UserMentionedNotification,
        workflow: 'user-mentioned',
        settings: {
            label: 'Mentioned in an internal note',
        },
    },
    'ticket.snooze-expired': {
        type: 'ticket.snooze-expired',
        component: TicketNotification,
        workflow: 'ticket-snooze-expired',
        settings: {
            label: 'Snooze expired',
        },
    },
    'ticket.assigned': {
        type: 'ticket.assigned',
        component: TicketNotification,
        workflow: 'ticket-assigned',
        settings: {
            label: 'Assigned to a ticket',
        },
    },
    'ticket-message.created.email': {
        type: 'ticket-message.created.email',
        component: TicketNotification,
        workflow: 'ticket-message-created-email',
        settings: {
            icon: 'email',
            label: 'Email',
        },
    },
    'ticket-message.created.chat': {
        type: 'ticket-message.created.chat',
        component: TicketNotification,
        workflow: 'ticket-message-created-chat',
        settings: {
            icon: 'chat',
            label: 'Chat',
        },
    },
    'ticket-message.created.phone': {
        type: 'ticket-message.created.phone',
        component: TicketNotification,
        workflow: 'ticket-message-created-phone',
        settings: {
            icon: 'phone',
            label: 'Phone',
            tooltip:
                'This setting only controls the messages sent after the original phone call.',
        },
    },
    'ticket-message.created.sms': {
        type: 'ticket-message.created.sms',
        component: TicketNotification,
        workflow: 'ticket-message-created-sms',
        settings: {
            icon: 'sms',
            label: 'SMS',
        },
    },
    'ticket-message.created.facebook': {
        type: 'ticket-message.created.facebook',
        component: TicketNotification,
        workflow: 'ticket-message-created-facebook',
        settings: {
            icon: 'facebook',
            label: 'Facebook',
            tooltip:
                'Facebook includes Messenger, comments, mentions and recommendations.',
        },
    },
    'ticket-message.created.instagram': {
        type: 'ticket-message.created.instagram',
        component: TicketNotification,
        workflow: 'ticket-message-created-instagram',
        settings: {
            icon: 'instagram',
            label: 'Instagram',
            tooltip:
                'Instagram includes Ad comments, comments, direct messages and mentions.',
        },
    },
    'ticket-message.created.whatsapp': {
        type: 'ticket-message.created.whatsapp',
        component: TicketNotification,
        workflow: 'ticket-message-created-whatsapp',
        settings: {
            icon: 'whatsapp',
            label: 'WhatsApp',
        },
    },
    'ticket-message.created.yotpo': {
        type: 'ticket-message.created.yotpo',
        component: TicketNotification,
        workflow: 'ticket-message-created-yotpo',
        settings: {
            icon: 'yotpo',
            label: 'Yotpo',
        },
    },
    'ticket-message.created.aircall': {
        type: 'ticket-message.created.aircall',
        component: TicketNotification,
        workflow: 'ticket-message-created-aircall',
        settings: {
            icon: 'aircall',
            label: 'Aircall',
        },
    },
    'ticket-message.created': {
        type: 'ticket-message.created',
        component: TicketNotification,
        workflow: 'ticket-message-created',
        settings: {
            icon: 'api',
            label: 'Other',
        },
    },
    'email-domain.verified': {
        type: 'email-domain.verified',
        component: DomainVerificationNotification,
        workflow: 'email-domain.verified',
    },
}
