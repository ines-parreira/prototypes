import type {RecentChatTicket} from '../../business/types/recentChats'
import * as socketConstants from '../../config/socketConstants.ts'

export type CustomerUpdatedEvent = {
    event: {
        type: 'customer-updated',
    },
    customer: Object,
}

export type UserLocationUpdatedEvent = {
    event: {
        type: 'user-location-updated',
    },
    locations: Object,
}

export type UserTypingStatusUpdatedEvent = {
    event: {
        type: 'user-typing-status-updated',
    },
    locations: Object,
}

export type TicketUpdatedEvent = {
    event: {
        type: 'ticket-updated',
    },
    ticket: {
        id: number,
    },
}

export type TicketMessageCreatedEvent = {
    event: {
        type: 'ticket-message-created',
    },
    ticket: {
        id: number,
    },
}

export type TicketMessageActionFailedEvent = {
    event: {
        type: 'ticket-message-action-failed',
    },
    ticket_id: number,
}

export type TicketMessageFailedEvent = {
    event: {
        type: 'ticket-message-failed',
        data: {
            error: {
                message: string,
            },
        },
    },
    ticket_id: number,
}

export type ActionExecutedEvent = {
    event: {
        type: 'action-executed',
    },
}

export type ViewCreatedEvent = {
    event: {
        type: 'view-created',
    },
    view: Object,
}

export type ViewUpdatedEvent = {
    event: {
        type: 'view-updated',
    },
    view: Object,
}

export type ViewDeletedEvent = {
    event: {
        type: 'view-deleted',
    },
    view: Object,
}

export type ViewCountUpdatedEvent = {
    event: {
        type: 'view-count-updated',
    },
    view: Object,
}

export type AccountUpdatedEvent = {
    event: {
        type: socketConstants.ACCOUNT_UPDATED,
    },
    account: {
        settings: Array<Object>,
    },
}

export type SIDUpdatedEvent = {
    event: {
        type: socketConstants.SID_UPDATED,
    },
}

export type TicketMessageChatCreatedEvent = {
    event: {
        type: socketConstants.TICKET_MESSAGE_CHAT_CREATED,
    },
    data: RecentChatTicket,
}

export type TicketChatUpdatedEvent = {
    event: {
        type: socketConstants.TICKET_CHAT_UPDATED,
    },
    data: RecentChatTicket,
}

export type EmailIntegrationVerifiedEvent = {
    event: {
        type: socketConstants.EMAIL_INTEGRATION_VERIFIED,
    },
    integration_id: number,
}

export type FacebookIntegrationsReconnected = {
    event: {
        type: socketConstants.FACEBOOK_INTEGRATIONS_RECONNECTED,
        total: number,
    },
}

export type ViewsDeactivated = {
    event: {
        type: socketConstants.VIEWS_DEACTIVATED,
        names: string[],
    },
}

export type ServerMessage =
    | CustomerUpdatedEvent
    | UserLocationUpdatedEvent
    | UserTypingStatusUpdatedEvent
    | TicketUpdatedEvent
    | TicketMessageCreatedEvent
    | TicketMessageActionFailedEvent
    | TicketMessageFailedEvent
    | ActionExecutedEvent
    | ViewCreatedEvent
    | ViewUpdatedEvent
    | ViewDeletedEvent
    | ViewCountUpdatedEvent
    | AccountUpdatedEvent
    | SIDUpdatedEvent
    | TicketMessageChatCreatedEvent
    | TicketChatUpdatedEvent
    | EmailIntegrationVerifiedEvent
    | FacebookIntegrationsReconnected
