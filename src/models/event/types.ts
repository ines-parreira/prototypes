import {RuleEvent} from '../../state/rules/types'
import {OrderDirection} from '../api/types'

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
    TicketSelfUnsnoozed = 'ticket-self-unsnoozed',
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

export enum EventType {
    AccountCreated = 'account-created',
    AccountDeactivated = 'account-deactivated',
    AccountUpdated = 'account-updated',
    CustomerCreated = 'customer-created',
    CustomerDeleted = 'customer-deleted',
    CustomerMerged = 'customer-merged',
    CustomerUpdated = 'customer-updated',
    IntegrationCreated = 'integration-created',
    IntegrationDeleted = 'integration-deleted',
    IntegrationUpdated = 'integration-updated',
    MacroCreated = 'macro-created',
    MacroDeleted = 'macro-deleted',
    MacroUpdated = 'macro-updated',
    RuleCreated = 'rule-created',
    RuleDeleted = 'rule-deleted',
    RuleUpdated = 'rule-updated',
    TagCreated = 'tag-created',
    TagDeleted = 'tag-deleted',
    TagMerged = 'tag-merged',
    TeamCreated = 'team-created',
    TeamDeleted = 'team-deleted',
    TeamUpdated = 'team-updated',
    TicketAssigned = 'ticket-assigned',
    TicketClosed = 'ticket-closed',
    TicketCreated = 'ticket-created',
    TicketCustomerUpdated = 'ticket-customer-updated',
    TicketMarkedSpam = 'ticket-marked-spam',
    TicketMerged = 'ticket-merged',
    TicketMessageCreated = 'ticket-message-created',
    TicketMessageDeleted = 'ticket-message-deleted',
    TicketMessageSummaryCreated = 'ticket-message-summary-created',
    TicketMessageUpdated = 'ticket-message-updated',
    TicketReopened = 'ticket-reopened',
    TicketSelfUnsnoozed = 'ticket-self-unsnoozed',
    TicketSnoozed = 'ticket-snoozed',
    TicketSubjectUpdated = 'ticket-subject-updated',
    TicketTagsAdded = 'ticket-tags-added',
    TicketTagsRemoved = 'ticket-tags-removed',
    TicketTeamAssigned = 'ticket-team-assigned',
    TicketTeamUnassigned = 'ticket-team-unassigned',
    TicketTrashed = 'ticket-trashed',
    TicketUnassigned = 'ticket-unassigned',
    TicketUnmarkedSpam = 'ticket-unmarked-spam',
    TicketUntrashed = 'ticket-untrashed',
    TicketUpdated = 'ticket-updated',
    UserCreated = 'user-created',
    UserDeleted = 'user-deleted',
    UserInvited = 'user-invited',
    UserLoggedIn = 'user-logged-in',
    UserLoggedOut = 'user-logged-out',
    UserPasswordChanged = 'user-password-changed',
    UserPasswordReset = 'user-password-reset',
    UserUpdated = 'user-updated',
    ViewCreated = 'view-created',
    ViewDeleted = 'view-deleted',
    ViewUpdated = 'view-updated',
    WidgetCreated = 'widget-created',
    WidgetDeleted = 'widget-deleted',
    WidgetUpdated = 'widget-updated',
}

export type Event = {
    id: number
    context: string
    created_datetime: string
    data: Record<string, unknown> | null
    object_id: number
    object_type: string
    type: string
    user_id: number
    uri: string
}

export enum EventsDatetimeOperator {
    LTE = 'lte',
    GTE = 'gte',
    GT = 'gt',
    LT = 'lt',
}

export type FetchEventsOptions = {
    objectId?: number
    createdDatetime?: Partial<Record<EventsDatetimeOperator, string>>
    orderDir?: OrderDirection
    orderBy?: EventSortableProperties
    objectType?: string
    types?: Array<EventType>
    userIds?: number[]
    cursor?: string
}

export enum EventSortableProperties {
    CreatedDatetime = 'createdDatetime',
}
