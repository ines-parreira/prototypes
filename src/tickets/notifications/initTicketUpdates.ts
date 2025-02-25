import { registerCategory, registerNotification } from 'common/notifications'

import TicketNotification from './components/TicketNotification'
import UserMentionedNotification from './components/UserMentionedNotification'
import type { TicketPayload } from './types'

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
registerNotification<TicketPayload>({
    type: 'user.mentioned',
    component: UserMentionedNotification,
    workflow: 'user-mentioned',
    settings: {
        type: 'ticket-updates',
        label: 'Mentioned in an internal note',
    },
})
registerNotification<TicketPayload>({
    type: 'ticket.snooze-expired',
    component: TicketNotification,
    workflow: 'ticket-snooze-expired',
    settings: {
        type: 'ticket-updates',
        label: 'Snooze expired',
    },
})
registerNotification<TicketPayload>({
    type: 'ticket.assigned',
    component: TicketNotification,
    workflow: 'ticket-assigned',
    settings: {
        type: 'ticket-updates',
        label: 'Assigned to a ticket',
    },
})
