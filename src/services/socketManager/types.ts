import type {RecentChatTicket} from '../../business/types/recentChats'
import * as socketConstants from '../../config/socketConstants.js'

export type CustomerUpdatedEvent = {
    event: {
        type: 'customer-updated'
    }
    customer: Record<string, unknown>
}

export type UserLocationUpdatedEvent = {
    event: {
        type: 'user-location-updated'
    }
    locations: Record<string, unknown>
}

export type UserTypingStatusUpdatedEvent = {
    event: {
        type: 'user-typing-status-updated'
    }
    locations: Record<string, unknown>
}

export type TicketUpdatedEvent = {
    event: {
        type: 'ticket-updated'
    }
    ticket: {
        id: number
    }
}

export type TicketMessageCreatedEvent = {
    event: {
        type: 'ticket-message-created'
    }
    ticket: {
        id: number
    }
}

export type TicketMessageActionFailedEvent = {
    event: {
        type: 'ticket-message-action-failed'
    }
    ticket_id: number
}

export type TicketMessageFailedEvent = {
    event: {
        type: 'ticket-message-failed'
        data: {
            error: {
                message: string
            }
        }
    }
    ticket_id: number
}

export type ActionExecutedEvent = {
    event: {
        type: 'action-executed'
    }
}

export type ViewCreatedEvent = {
    event: {
        type: 'view-created'
    }
    view: Record<string, unknown>
}

export type ViewUpdatedEvent = {
    event: {
        type: 'view-updated'
    }
    view: Record<string, unknown>
}

export type ViewDeletedEvent = {
    event: {
        type: 'view-deleted'
    }
    view: Record<string, unknown>
}

export type ViewCountUpdatedEvent = {
    event: {
        type: 'view-count-updated'
    }
    view: Record<string, unknown>
}

export type AccountUpdatedEvent = {
    event: {
        type: typeof socketConstants.ACCOUNT_UPDATED
    }
    account: {
        settings: Array<Record<string, unknown>>
    }
}

export type SIDUpdatedEvent = {
    event: {
        type: typeof socketConstants.SID_UPDATED
    }
}

export type TicketMessageChatCreatedEvent = {
    event: {
        type: typeof socketConstants.TICKET_MESSAGE_CHAT_CREATED
    }
    data: RecentChatTicket
}

export type TicketChatUpdatedEvent = {
    event: {
        type: typeof socketConstants.TICKET_CHAT_UPDATED
    }
    data: RecentChatTicket
}

export type EmailIntegrationVerifiedEvent = {
    event: {
        type: typeof socketConstants.EMAIL_INTEGRATION_VERIFIED
    }
    integration_id: number
}

export type FacebookIntegrationsReconnected = {
    event: {
        type: typeof socketConstants.FACEBOOK_INTEGRATIONS_RECONNECTED
        total: number
    }
}

export type ViewsDeactivated = {
    event: {
        type: typeof socketConstants.VIEWS_DEACTIVATED
        names: string[]
    }
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
