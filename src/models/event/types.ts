import {RuleEvent} from '../../state/rules/types'

export type TicketTagsAddedEventData = {
    tags_added: number[]
}

export type TicketTagsRemovedEventData = {
    tags_removed: number[]
}

export type TicketAssignedEventData = {
    assignee_user_id: number
}

export type TicketTeamAssignedEventData = {
    assignee_team_id: number
}

export type TicketRuleExecutedEventData =
    | {
          id: number
          name: string
          triggering_event_type?: RuleEvent
      }
    | {
          type: string
      }

export type TicketMessageSummaryCreatedEventData = {
    first_unseen_id: number
    last_unseen_id: number
}

export type TicketSubjectUpdatedEventData = {
    new_subject: string
    old_subject: string
}

export type TicketCustomerUpdatedEventData = {
    old_customer: {
        id: number
        name: string | null
    }
    new_customer: {
        id: number
        name: string | null
    }
}

export type RuleExecutedEventData = {
    id: number
    uri: string
    code: string
    name: string
    type: string
    priority: number
    schedule: Maybe<string>
    description: Maybe<string>
    event_types: string
    created_datetime: string
    updated_datetime: string
    deactivated_datetime: Maybe<string>
}

export type AuditLogEventData =
    | TicketTagsAddedEventData
    | TicketTagsRemovedEventData
    | TicketAssignedEventData
    | TicketTeamAssignedEventData
    | RuleExecutedEventData
    | TicketRuleExecutedEventData
    | TicketMessageSummaryCreatedEventData
    | TicketSubjectUpdatedEventData
    | TicketCustomerUpdatedEventData

export enum AuditLogEventObjectType {
    Customer = 'Customer',
    Tag = 'Tag',
    TicketMessage = 'TicketMessage',
    Ticket = 'Ticket',
    User = 'User',
}

export enum AuditLogEventType {
    RuleExecuted = 'rule-executed',
    TicketAssigned = 'ticket-assigned',
    TicketClosed = 'ticket-closed',
    TicketCreated = 'ticket-created',
    TicketCustomerUpdated = 'ticket-customer-updated',
    TicketMarkedSpam = 'ticket-marked-spam',
    TicketMerged = 'ticket-merged',
    TicketMessageCreated = 'ticket-message-created',
    TicketMessageSummaryCreated = 'ticket-message-summary-created',
    TicketReopened = 'ticket-reopened',
    TicketSnoozed = 'ticket-snoozed',
    TicketTagsAdded = 'ticket-tags-added',
    TicketTagsRemoved = 'ticket-tags-removed',
    TicketTeamAssigned = 'ticket-team-assigned',
    TicketTeamUnassigned = 'ticket-team-unassigned',
    TicketTrashed = 'ticket-trashed',
    TicketUnassigned = 'ticket-unassigned',
    TicketUnmarkedSpam = 'ticket-unmarked-spam',
    TicketUntrashed = 'ticket-untrashed',
    TicketUpdated = 'ticket-updated',
    TicketSubjectUpdated = 'ticket-subject-updated',
}

export type AuditLogEvent = {
    id: number
    account_id: number
    user_id: Maybe<number>
    object_type: AuditLogEventObjectType
    object_id: number
    data: Maybe<AuditLogEventData>
    context: string
    type: AuditLogEventType
    created_datetime: string
}
