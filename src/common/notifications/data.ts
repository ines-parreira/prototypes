import {TicketChannel} from 'business/types/ticket'

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
        label: 'New messages from all channels',
    },
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

export const enabledEvents = events.filter((event) => event.enabled)

export const workflowMap: Record<NotificationType, string> = {
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
