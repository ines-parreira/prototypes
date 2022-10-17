import {Map} from 'immutable'

import {TicketChannel} from 'business/types/ticket'
import {MacrosProperties} from 'models/macro/types'
import {CustomerExternalData} from 'state/customers/types'
import {RecentChatTicket} from '../../business/types/recentChats'
import {Ticket} from '../../models/ticket/types'
import {View} from '../../models/view/types'
import {Account} from '../../state/currentAccount/types'
import {ActionData} from '../../state/infobar/utils'
import {Section} from '../../models/section/types'

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
    SelfServiceConfigurationsUpdated = 'self-service-configurations-updated',
    SelfServiceConfigurationsUpdateStarted = 'self-service-configurations-update-started',
    EmailIntegrationVerified = 'email.integration-verified',
    EmailForwardingActivated = 'email.forwarding-activated',
    FacebookIntegrationsReconnected = 'facebook-integrations-reconnected',
    ViewsDeactivated = 'views-deactivated',
    OutboundPhoneCallInitiated = 'outbound-phone-call-initiated',
    MacroParamsUpdated = 'macro-params-updated',
    TwilioEventTriggered = 'twilio-event-triggered',
    AgentAvailabilityUpdated = 'agent-availability-updated',
    CustomerExternalDataUpdated = 'customer-external-data-updated',
}

export enum JoinEventType {
    Ticket = 'ticket',
    Customer = 'customer',
    View = 'view',
    Integration = 'integration',
}

export type CustomerUpdatedEvent = {
    event: {
        type: 'customer-updated'
    }
    customer: Map<any, any>
}

export type CustomerExternalDataUpdatedEvent = {
    event: {
        type: SocketEventType.CustomerExternalDataUpdated
    }
    external_data: CustomerExternalData
    customer_id: number
}

export type SelfServiceConfigurationsUpdatedEvent = {
    event: {
        type: SocketEventType.SelfServiceConfigurationsUpdated
    }
    account: Account
}

export type SelfServiceConfigurationsUpdateStartedEvent = {
    event: {
        type: SocketEventType.SelfServiceConfigurationsUpdateStarted
    }
    account: Account
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
    ticket: Ticket
}

export type TicketAssignedEvent = {
    event: {
        type: 'ticket-assigned'
    }
    ticket: {
        channel: TicketChannel
        id: number
        subject: string
    }
}

export type TicketMessageCreatedEvent = {
    event: {
        type: 'ticket-message-created'
    }
    ticket: Ticket
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

export type ActionExecutedEvent = ActionData & {
    event: {
        type: 'action-executed'
    }
    status: string
    msg: string
}

export type ViewCreatedEvent = {
    event: {
        type: 'view-created'
    }
    view: View
}

export type ViewUpdatedEvent = {
    event: {
        type: 'view-updated'
    }
    view: View
}

export type ViewDeletedEvent = {
    event: {
        type: 'view-deleted'
    }
    view: View
}

export type ViewCountUpdatedEvent = {
    event: {
        type: 'view-count-updated'
    }
    view: View
    counts: {[key: string]: number}
}

export type ViewSectionCreatedEvent = {
    event: {
        type: 'view-section-created'
    }
    view_section: Section
}

export type ViewSectionUpdatedEvent = {
    event: {
        type: 'view-section-updated'
    }
    view_section: Section
}

export type ViewSectionDeletedEvent = {
    event: {
        type: 'view-section-deleted'
    }
    view_section: Section
}

export type AccountUpdatedEvent = {
    event: {
        type: SocketEventType.AccountUpdated
    }
    account: Account
}

export type SIDUpdatedEvent = {
    event: {
        type: SocketEventType.SidUpdated
    }
}

export type TicketMessageChatCreatedEvent = {
    event: {
        type: SocketEventType.TicketMessageChatCreated
        play_sound_notification?: boolean
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

export type OutboundPhoneCallInitiated = {
    event: {
        type: SocketEventType.OutboundPhoneCallInitiated
        phone_ticket_id: number
        original_path: string
    }
}

export type MacroParamsUpdatedEvent = {
    event: {
        type: SocketEventType.MacroParamsUpdated
        parameters_options: MacrosProperties
    }
}

export type AgentAvailabilityUpdatedEvent = {
    event: {
        type: SocketEventType.AgentAvailabilityUpdated
    }
    data: {
        available: boolean
        user_id: number
    }
}

export type ServerMessage =
    | CustomerUpdatedEvent
    | CustomerExternalDataUpdatedEvent
    | SelfServiceConfigurationsUpdatedEvent
    | SelfServiceConfigurationsUpdateStartedEvent
    | UserLocationUpdatedEvent
    | UserTypingStatusUpdatedEvent
    | TicketUpdatedEvent
    | TicketAssignedEvent
    | TicketMessageCreatedEvent
    | TicketMessageActionFailedEvent
    | TicketMessageFailedEvent
    | ActionExecutedEvent
    | ViewCreatedEvent
    | ViewUpdatedEvent
    | ViewDeletedEvent
    | ViewCountUpdatedEvent
    | ViewSectionCreatedEvent
    | ViewSectionUpdatedEvent
    | ViewSectionDeletedEvent
    | AccountUpdatedEvent
    | SIDUpdatedEvent
    | TicketMessageChatCreatedEvent
    | TicketChatUpdatedEvent
    | EmailIntegrationVerifiedEvent
    | FacebookIntegrationsReconnected
    | ViewsDeactivated
    | OutboundPhoneCallInitiated
    | MacroParamsUpdatedEvent
    | AgentAvailabilityUpdatedEvent
