import {RecentChatTicket} from '../../business/types/recentChats'

export enum BroadcastChannelEvent {
    ServerMessage = 'SERVER_MESSAGE',
    WsConnected = 'WS_CONNECTED',
    WsDisconnected = 'WS_DISCONNECTED',
}

export enum MessagePortEvent {
    ClientConnected = 'CLIENT_CONNECTED',
    HealthCheck = 'HEALTH_CHECK',
}

export enum SocketEventType {
    AgentActive = 'agent-active',
    AgentInactive = 'agent-inactive',
    AccountUpdated = 'account-updated',
    TicketViewed = 'ticket-viewed',
    RoomJoined = 'room-joined',
    RoomLeft = 'room-left',
    AgentTypingStarted = 'agent-typing-started',
    AgentTypingStopped = 'agent-typing-stopped',
    ViewsCountExpired = 'views-counts-expired',
    SidUpdated = 'sid-updated',
    TicketMessageChatCreated = 'ticket-message-chat-created',
    TicketChatUpdated = 'ticket-chat-updated',
    EmailIntegrationVerified = 'email.integration-verified',
    FacebookIntegrationsReconnected = 'facebook-integrations-reconnected',
    ViewsDeactivated = 'views-deactivated',
}

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
        type: SocketEventType.AccountUpdated
    }
    account: {
        settings: Array<Record<string, unknown>>
    }
}

export type SIDUpdatedEvent = {
    event: {
        type: SocketEventType.SidUpdated
    }
}

export type TicketMessageChatCreatedEvent = {
    event: {
        type: SocketEventType.TicketMessageChatCreated
    }
    data: RecentChatTicket
}

export type TicketChatUpdatedEvent = {
    event: {
        type: SocketEventType.TicketChatUpdated
    }
    data: RecentChatTicket
}

export type EmailIntegrationVerifiedEvent = {
    event: {
        type: SocketEventType.EmailIntegrationVerified
    }
    integration_id: number
}

export type FacebookIntegrationsReconnected = {
    event: {
        type: SocketEventType.FacebookIntegrationsReconnected
        total: number
    }
}

export type ViewsDeactivated = {
    event: {
        type: SocketEventType.ViewsDeactivated
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
