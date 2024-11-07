import {TicketChannel} from 'business/types/ticket'

import DomainVerificationNotification from './components/DomainVerificationNotification'
import TicketNotification from './components/TicketNotification'
import UserMentionedNotification from './components/UserMentionedNotification'

import {
    CategoryConfig,
    Channel,
    Event,
    LegacyEvent,
    NotificationConfig,
    NotificationType,
} from './types'

export const channels: Channel[] = [
    {
        type: 'in_app_feed',
        label: 'Browser',
    },
]

export const legacyEvent: LegacyEvent = {
    enabled: true,
    type: 'legacy-chat-and-messaging',
    label: 'Chat & messaging tickets',
}

export const events: Event[] = [
    {
        enabled: true,
        type: 'user.mentioned',
        label: 'Mentioned in an internal note',
    },
    {
        enabled: true,
        type: 'ticket.snooze-expired',
        label: 'Snooze expired',
    },
    {
        enabled: true,
        type: 'ticket.assigned',
        label: 'Assigned to a ticket',
    },
]

export const ticketMessageCreatedEvents: Event[] = [
    {
        enabled: true,
        type: 'ticket-message.created.email',
        icon: 'email',
        label: 'Email',
    },
    {
        enabled: true,
        type: 'ticket-message.created.chat',
        icon: 'chat',
        label: 'Chat',
    },
    {
        enabled: true,
        type: 'ticket-message.created.phone',
        icon: 'phone',
        label: 'Phone',
        tooltip:
            'This setting only controls the messages sent after the original phone call.',
    },
    {
        enabled: true,
        type: 'ticket-message.created.sms',
        icon: 'sms',
        label: 'SMS',
    },
    {
        enabled: true,
        type: 'ticket-message.created.facebook',
        icon: 'facebook',
        label: 'Facebook',
        tooltip:
            'Facebook includes Messenger, comments, mentions and recommendations.',
    },
    {
        enabled: true,
        type: 'ticket-message.created.instagram',
        icon: 'instagram',
        label: 'Instagram',
        tooltip:
            'Instagram includes Ad comments, comments, direct messages and mentions.',
    },
    {
        enabled: true,
        type: 'ticket-message.created.whatsapp',
        icon: 'whatsapp',
        label: 'WhatsApp',
    },
    {
        enabled: true,
        type: 'ticket-message.created.yotpo',
        icon: 'yotpo',
        label: 'Yotpo',
    },
    {
        enabled: true,
        type: 'ticket-message.created.aircall',
        icon: 'aircall',
        label: 'Aircall',
    },
    {
        enabled: true,
        type: 'ticket-message.created',
        icon: 'api',
        label: 'Other',
    },
]

export const enabledEvents = [legacyEvent, ...events].filter(
    (event) => event.enabled
)

export const workflowMap: Record<NotificationType, string> = {
    'email-domain.verified': 'email-domain.verified',
    'ticket.snooze-expired': 'ticket-snooze-expired',
    'ticket-message.created': 'ticket-message-created',
    'user.mentioned': 'user-mentioned',
    'ticket.assigned': 'ticket-assigned',
    'ticket-message.created.email': 'ticket-message-created-email',
    'ticket-message.created.chat': 'ticket-message-created-chat',
    'ticket-message.created.phone': 'ticket-message-created-phone',
    'ticket-message.created.sms': 'ticket-message-created-sms',
    'ticket-message.created.facebook': 'ticket-message-created-facebook',
    'ticket-message.created.instagram': 'ticket-message-created-instagram',
    'ticket-message.created.whatsapp': 'ticket-message-created-whatsapp',
    'ticket-message.created.yotpo': 'ticket-message-created-yotpo',
    'ticket-message.created.aircall': 'ticket-message-created-aircall',
}

export const ticketMessageCreatedChannelWorkflowMap: Partial<
    Record<TicketChannel, string>
> = {
    [TicketChannel.Email]: 'ticket-message.created.email',
    [TicketChannel.Chat]: 'ticket-message.created.chat',
    [TicketChannel.Phone]: 'ticket-message.created.phone',
    [TicketChannel.Sms]: 'ticket-message.created.sms',
    [TicketChannel.Facebook]: 'ticket-message.created.facebook',
    [TicketChannel.FacebookMention]: 'ticket-message.created.facebook',
    [TicketChannel.FacebookMessenger]: 'ticket-message.created.facebook',
    [TicketChannel.FacebookRecommendations]: 'ticket-message.created.facebook',
    [TicketChannel.InstagramAdComment]: 'ticket-message.created.instagram',
    [TicketChannel.InstagramComment]: 'ticket-message.created.instagram',
    [TicketChannel.InstagramDirectMessage]: 'ticket-message.created.instagram',
    [TicketChannel.InstagramMention]: 'ticket-message.created.instagram',
    [TicketChannel.WhatsApp]: 'ticket-message.created.whatsapp',
    [TicketChannel.YotpoReview]: 'ticket-message.created.yotpo',
    [TicketChannel.Aircall]: 'ticket-message.created.aircall',
}

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
        settings: {
            label: 'Chat & messaging tickets',
        },
    },
    'user.mentioned': {
        type: 'user.mentioned',
        component: UserMentionedNotification,
        settings: {
            label: 'Mentioned in an internal note',
        },
    },
    'ticket.snooze-expired': {
        type: 'ticket.snooze-expired',
        component: TicketNotification,
        settings: {
            label: 'Snooze expired',
        },
    },
    'ticket.assigned': {
        type: 'ticket.assigned',
        component: TicketNotification,
        settings: {
            label: 'Assigned to a ticket',
        },
    },
    'ticket-message.created.email': {
        type: 'ticket-message.created.email',
        component: TicketNotification,
        settings: {
            icon: 'email',
            label: 'Email',
        },
    },
    'ticket-message.created.chat': {
        type: 'ticket-message.created.chat',
        component: TicketNotification,
        settings: {
            icon: 'chat',
            label: 'Chat',
        },
    },
    'ticket-message.created.phone': {
        type: 'ticket-message.created.phone',
        component: TicketNotification,
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
        settings: {
            icon: 'sms',
            label: 'SMS',
        },
    },
    'ticket-message.created.facebook': {
        type: 'ticket-message.created.facebook',
        component: TicketNotification,
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
        settings: {
            icon: 'whatsapp',
            label: 'WhatsApp',
        },
    },
    'ticket-message.created.yotpo': {
        type: 'ticket-message.created.yotpo',
        component: TicketNotification,
        settings: {
            icon: 'yotpo',
            label: 'Yotpo',
        },
    },
    'ticket-message.created.aircall': {
        type: 'ticket-message.created.aircall',
        component: TicketNotification,
        settings: {
            icon: 'aircall',
            label: 'Aircall',
        },
    },
    'ticket-message.created': {
        type: 'ticket-message.created',
        component: TicketNotification,
        settings: {
            icon: 'api',
            label: 'Other',
        },
    },
    'email-domain.verified': {
        type: 'email-domain.verified',
        component: DomainVerificationNotification,
    },
}
