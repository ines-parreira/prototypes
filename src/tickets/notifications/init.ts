import {registerCategory, registerNotification} from 'common/notifications'

import TicketNotification from './components/TicketNotification'
import UserMentionedNotification from './components/UserMentionedNotification'
import mapTicketMessageCreatedType from './utils/mapTicketMessageCreatedType'

registerCategory({
    type: 'ticket-updates',
    label: 'Ticket updates',
    description: 'Get notified when one of these events happen:',
    typeLabel: 'Event',
})
registerNotification({
    type: 'legacy-chat-and-messaging',
    component: TicketNotification,
    workflow: '',
    settings: {
        type: 'ticket-updates',
        label: 'Chat & messaging tickets',
    },
})
registerNotification({
    type: 'user.mentioned',
    component: UserMentionedNotification,
    workflow: 'user-mentioned',
    settings: {
        type: 'ticket-updates',
        label: 'Mentioned in an internal note',
    },
})
registerNotification({
    type: 'ticket.snooze-expired',
    component: TicketNotification,
    workflow: 'ticket-snooze-expired',
    settings: {
        type: 'ticket-updates',
        label: 'Snooze expired',
    },
})
registerNotification({
    type: 'ticket.assigned',
    component: TicketNotification,
    workflow: 'ticket-assigned',
    settings: {
        type: 'ticket-updates',
        label: 'Assigned to a ticket',
    },
})

registerCategory({
    type: 'ticket-message-created',
    label: 'New messages',
    description:
        'Get notified when you receive new messages from these channels.',
    typeLabel: 'Message channel',
})
registerNotification({
    type: 'ticket-message.created.email',
    component: TicketNotification,
    workflow: 'ticket-message-created-email',
    settings: {
        type: 'ticket-message-created',
        icon: 'email',
        label: 'Email',
    },
})
registerNotification({
    type: 'ticket-message.created.chat',
    component: TicketNotification,
    workflow: 'ticket-message-created-chat',
    settings: {
        type: 'ticket-message-created',
        icon: 'chat',
        label: 'Chat',
    },
})
registerNotification({
    type: 'ticket-message.created.phone',
    component: TicketNotification,
    workflow: 'ticket-message-created-phone',
    settings: {
        type: 'ticket-message-created',
        icon: 'phone',
        label: 'Phone',
        tooltip:
            'This setting only controls the messages sent after the original phone call.',
    },
})
registerNotification({
    type: 'ticket-message.created.sms',
    component: TicketNotification,
    workflow: 'ticket-message-created-sms',
    settings: {
        type: 'ticket-message-created',
        icon: 'sms',
        label: 'SMS',
    },
})
registerNotification({
    type: 'ticket-message.created.facebook',
    component: TicketNotification,
    workflow: 'ticket-message-created-facebook',
    settings: {
        type: 'ticket-message-created',
        icon: 'facebook',
        label: 'Facebook',
        tooltip:
            'Facebook includes Messenger, comments, mentions and recommendations.',
    },
})
registerNotification({
    type: 'ticket-message.created.instagram',
    component: TicketNotification,
    workflow: 'ticket-message-created-instagram',
    settings: {
        type: 'ticket-message-created',
        icon: 'instagram',
        label: 'Instagram',
        tooltip:
            'Instagram includes Ad comments, comments, direct messages and mentions.',
    },
})
registerNotification({
    type: 'ticket-message.created.whatsapp',
    component: TicketNotification,
    workflow: 'ticket-message-created-whatsapp',
    settings: {
        type: 'ticket-message-created',
        icon: 'whatsapp',
        label: 'WhatsApp',
    },
})
registerNotification({
    type: 'ticket-message.created.yotpo',
    component: TicketNotification,
    workflow: 'ticket-message-created-yotpo',
    settings: {
        type: 'ticket-message-created',
        icon: 'yotpo',
        label: 'Yotpo',
    },
})
registerNotification({
    type: 'ticket-message.created.aircall',
    component: TicketNotification,
    workflow: 'ticket-message-created-aircall',
    settings: {
        type: 'ticket-message-created',
        icon: 'aircall',
        label: 'Aircall',
    },
})
registerNotification({
    type: 'ticket-message.created',
    component: TicketNotification,
    mapType: mapTicketMessageCreatedType,
    workflow: 'ticket-message-created',
    settings: {
        type: 'ticket-message-created',
        icon: 'api',
        label: 'Other',
    },
})
