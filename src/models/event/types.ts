import {List} from 'immutable'
import _pick from 'lodash/pick'

import {ApiCursorPaginationParams, OrderParams} from 'models/api/types'
import {RuleEvent} from 'state/rules/types'

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
    auto_assigned?: boolean
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

export type EventData =
    | TicketTagsAddedEventData
    | TicketTagsRemovedEventData
    | TicketAssignedEventData
    | TicketTeamAssignedEventData
    | RuleExecutedEventData
    | RuleSuggestionEventData
    | TicketRuleExecutedEventData
    | TicketMessageSummaryCreatedEventData
    | TicketSubjectUpdatedEventData
    | TicketCustomerUpdatedEventData

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
    RuleSuggestionSuggested = 'rule-suggestion-suggested',
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
    TicketDeleted = 'ticket-deleted',
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

export enum EventObjectType {
    Account = 'Account',
    Macro = 'Macro',
    Tag = 'Tag',
    Customer = 'Customer',
    Team = 'Team',
    View = 'View',
    Widget = 'Widget',
    User = 'User',
    TicketMessage = 'TicketMessage',
    Ticket = 'Ticket',
    Rule = 'Rule',
    Integration = 'Integration',
}

export type Event = {
    id: number
    context: string
    created_datetime: string
    data: EventData | null
    object_id: number
    object_type: EventObjectType
    type: EventType
    user_id: number
    uri: string
}

export enum EventsDatetimeOperator {
    LTE = 'lte',
    GTE = 'gte',
    GT = 'gt',
    LT = 'lt',
}

export type FetchEventsOptions = ApiCursorPaginationParams &
    OrderParams<EventSortableProperties> & {
        objectId?: number
        createdDatetime?: Partial<Record<EventsDatetimeOperator, string>>
        objectType?: EventObjectType
        types?: Array<EventType>
        userIds?: number[]
    }

export enum EventSortableProperties {
    CreatedDatetime = 'created_datetime',
}

export const TICKET_EVENT_TYPES = Object.freeze({
    ..._pick(EventType, [
        'TicketAssigned',
        'TicketClosed',
        'TicketCreated',
        'TicketCustomerUpdated',
        'TicketMarkedSpam',
        'TicketMerged',
        'TicketMessageCreated',
        'TicketMessageSummaryCreated',
        'TicketReopened',
        'TicketSnoozed',
        'TicketSelfUnsnoozed',
        'TicketTagsAdded',
        'TicketTagsRemoved',
        'TicketTeamAssigned',
        'TicketTeamUnassigned',
        'TicketTrashed',
        'TicketUnassigned',
        'TicketUnmarkedSpam',
        'TicketUntrashed',
        'TicketUpdated',
        'TicketSubjectUpdated',
        'RuleSuggestionSuggested',
    ]),
    RuleExecuted: 'rule-executed',
} as const)

export type TicketEventType = ValueOf<typeof TICKET_EVENT_TYPES>

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
    failed_actions: Maybe<List<any>>
}

export type RuleSuggestionEventData = {
    slug: string
}

export const RULE_ACTIONS_EVENT_TYPES = Object.freeze([
    EventType.TicketAssigned,
    EventType.TicketClosed,
    EventType.TicketReopened,
    EventType.TicketSnoozed,
    EventType.TicketTagsAdded,
    EventType.TicketTagsRemoved,
    EventType.TicketTeamAssigned,
    EventType.TicketTeamUnassigned,
    EventType.TicketUnassigned,
    EventType.TicketSubjectUpdated,
])

export enum RuleActionFailureCauses {
    NoReplyUnanswerableChannel = 'unanswerable-channel',
    NoReplyToAgent = 'no-autoreply-no-nonagents',
    NoReplyRecent = 'recent-auto-reply',
    NoReplyNoReturnPath = 'no-return-path',
    NoReplyAutoSubmitted = 'auto-submitted',
    NoReplyNotEmail = 'not-email',
    NoSnoozeClosedTicket = 'no-snooze-closed-ticket',
    NoSnoozePastDate = 'snooze-datetime-in-past',
    NoAssignUserNotFound = 'user-not-found',
    NoTeamAssignUserNotFound = 'team-not-found',
    NoEmailNoRecipient = 'no-recipient',
    NoEmailIntegrationNotFound = 'integration-not-found',
    MissingHelpCenter = 'missing-help-center',
}

export enum RuleActionFailureSeverity {
    Warning = 'warning',
    Error = 'error',
}

export type RuleActionFailureType = {
    description: string
    severity: string
}

export const rulesActionsFailures: {
    [key: string]: RuleActionFailureType
} = {
    [RuleActionFailureCauses.NoReplyUnanswerableChannel]: {
        description: 'The channel of the previous message is not eligible.',
        severity: RuleActionFailureSeverity.Warning,
    },
    [RuleActionFailureCauses.NoReplyToAgent]: {
        description: 'Can only auto-reply to customer messages.',
        severity: RuleActionFailureSeverity.Warning,
    },
    [RuleActionFailureCauses.NoReplyRecent]: {
        description:
            'Can only auto-reply to a given customer once every 5 minutes.',
        severity: RuleActionFailureSeverity.Warning,
    },
    [RuleActionFailureCauses.NoReplyNoReturnPath]: {
        description:
            'No return-path specified in the header of the previous message.',
        severity: RuleActionFailureSeverity.Warning,
    },
    [RuleActionFailureCauses.NoReplyAutoSubmitted]: {
        description: 'Cannot auto-reply to an auto-generated message.',
        severity: RuleActionFailureSeverity.Warning,
    },
    [RuleActionFailureCauses.NoReplyNotEmail]: {
        description: 'Can only auto-reply to email messages.',
        severity: RuleActionFailureSeverity.Warning,
    },

    [RuleActionFailureCauses.NoSnoozeClosedTicket]: {
        description: 'Cannot only snooze an open ticket.',
        severity: RuleActionFailureSeverity.Warning,
    },
    [RuleActionFailureCauses.NoSnoozePastDate]: {
        description: 'Specified snooze date is in the past.',
        severity: RuleActionFailureSeverity.Warning,
    },

    [RuleActionFailureCauses.NoAssignUserNotFound]: {
        description: 'Could not find the agent to assign this ticket to.',
        severity: RuleActionFailureSeverity.Error,
    },
    [RuleActionFailureCauses.NoAssignUserNotFound]: {
        description: 'Could not find the team to assign this ticket to.',
        severity: RuleActionFailureSeverity.Error,
    },

    [RuleActionFailureCauses.NoEmailNoRecipient]: {
        description: 'The recipient of the email was not specified.',
        severity: RuleActionFailureSeverity.Warning,
    },
    [RuleActionFailureCauses.NoEmailIntegrationNotFound]: {
        description:
            'The integration used to send the email was deactivated or deleted.',
        severity: RuleActionFailureSeverity.Error,
    },
    [RuleActionFailureCauses.MissingHelpCenter]: {
        description:
            'The connected help-center has either been deactivated or deleted.',
        severity: RuleActionFailureSeverity.Error,
    },
}
