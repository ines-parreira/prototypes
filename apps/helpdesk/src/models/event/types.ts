import type { List } from 'immutable'
import _omit from 'lodash/omit'
import _pick from 'lodash/pick'

import type { ApiPaginationParams, OrderParams } from 'models/api/types'
import type { RuleEvent } from 'state/rules/types'

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

export type TicketEventPrivateReplyData = {
    payload: {
        private_reply_event_type: string
    }
    facebook_comment_ticket_id?: string // deprecated
    instagram_comment_ticket_id?: string // deprecated
    messenger_ticket_id?: string // deprecated
    instagram_direct_message_ticket_id?: string // deprecated
}

export type TicketCreatedEventData = {
    split_from_ticket?: {
        id: number
        closed_datetime: string
    }
}

export type TicketSplitEventData = {
    split_into_ticket: {
        id: number
    }
}

export type TicketSatisfactionSurveySkippedData = {
    reasons: string[]
}

export type SatisfactionSurveyRespondedEventData = {
    score: number
    body_text?: string
}

export type TicketSlaPolicyAssignedEventData = {
    sla_policy_version_id: number
    sla_policy_name: string
    sla_policy_uuid: string
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
    | TicketEventPrivateReplyData
    | TicketCreatedEventData
    | TicketSplitEventData
    | TicketSatisfactionSurveySkippedData
    | SatisfactionSurveyRespondedEventData
    | TicketSlaPolicyAssignedEventData

export enum EventType {
    AccountCreated = 'account-created',
    AccountDeactivated = 'account-deactivated',
    AccountSettingUpdated = 'account-setting-updated',
    AccountUpdated = 'account-updated',
    ActionExecuted = 'action-executed',
    CustomFieldConditionCreated = 'custom-field-condition-created',
    CustomFieldConditionDeleted = 'custom-field-condition-deleted',
    CustomFieldConditionDisabled = 'custom-field-condition-disabled',
    CustomFieldConditionEnabled = 'custom-field-condition-enabled',
    CustomFieldConditionUpdated = 'custom-field-condition-updated',
    CustomFieldCreated = 'custom-field-created',
    CustomFieldUpdated = 'custom-field-updated',
    CustomerCreated = 'customer-created',
    CustomerDeleted = 'customer-deleted',
    CustomerMerged = 'customer-merged',
    CustomerUpdated = 'customer-updated',
    IntegrationCreated = 'integration-created',
    IntegrationDeactivated = 'integration-deactivated',
    IntegrationDeleted = 'integration-deleted',
    IntegrationReactivated = 'integration-reactivated',
    IntegrationUpdated = 'integration-updated',
    MacroCreated = 'macro-created',
    MacroDeleted = 'macro-deleted',
    MacroUpdated = 'macro-updated',
    RuleCreated = 'rule-created',
    RuleDeleted = 'rule-deleted',
    RuleExecuted = 'rule-executed',
    RulePriorityUpdated = 'rule-priority-updated',
    RuleSuggestionSuggested = 'rule-suggestion-suggested',
    RuleUpdated = 'rule-updated',
    SatisfactionSurveyResponded = 'satisfaction-survey-responded',
    SatisfactionSurveySent = 'satisfaction-survey-sent',
    TagCreated = 'tag-created',
    TagDeleted = 'tag-deleted',
    TagMerged = 'tag-merged',
    TagRenamed = 'tag-renamed',
    TagUpdated = 'tag-updated',
    TeamCreated = 'team-created',
    TeamDeleted = 'team-deleted',
    TeamUpdated = 'team-updated',
    TicketAssigned = 'ticket-assigned',
    TicketClosed = 'ticket-closed',
    TicketCreated = 'ticket-created',
    TicketCustomerUpdated = 'ticket-customer-updated',
    TicketDeleted = 'ticket-deleted',
    TicketExcludedFromAutoMerge = 'ticket-excluded-from-auto-merge',
    TicketExcludedFromCSAT = 'ticket-excluded-from-csat',
    TicketMarkedSpam = 'ticket-marked-spam',
    TicketMerged = 'ticket-merged',
    TicketMessageCreated = 'ticket-message-created',
    TicketMessageDeleted = 'ticket-message-deleted',
    TicketMessageFailed = 'ticket-message-failed',
    TicketMessageSummaryCreated = 'ticket-message-summary-created',
    TicketMessageUpdated = 'ticket-message-updated',
    TicketReopened = 'ticket-reopened',
    TicketSatisfactionSurveySkipped = 'ticket-satisfaction-survey-skipped',
    TicketSelfUnsnoozed = 'ticket-self-unsnoozed',
    TicketSlaPolicyAssigned = 'ticket-sla-policy-assigned',
    TicketSnoozed = 'ticket-snoozed',
    TicketSplit = 'ticket-split',
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
    User2faChanged = 'user-2fa-changed',
    UserCreated = 'user-created',
    UserDeleted = 'user-deleted',
    UserInvited = 'user-invited',
    UserLoggedIn = 'user-logged-in',
    UserLoggedOut = 'user-logged-out',
    UserPasswordChanged = 'user-password-changed',
    UserPasswordReset = 'user-password-reset',
    UserUpdated = 'user-updated',
    ViewCreated = 'view-created',
    ViewDeactivated = 'view-deactivated',
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
    SatisfactionSurvey = 'SatisfactionSurvey',
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

export type FetchEventsOptions = ApiPaginationParams &
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
        'RuleExecuted',
        'RuleSuggestionSuggested',
        'TicketAssigned',
        'TicketClosed',
        'TicketCreated',
        'TicketSplit',
        'TicketCustomerUpdated',
        'TicketExcludedFromAutoMerge',
        'TicketExcludedFromCSAT',
        'TicketMarkedSpam',
        'TicketMerged',
        'TicketMessageCreated',
        'TicketMessageSummaryCreated',
        'TicketReopened',
        'TicketSatisfactionSurveySkipped',
        'TicketSelfUnsnoozed',
        'TicketSnoozed',
        'TicketSubjectUpdated',
        'TicketTagsAdded',
        'TicketTagsRemoved',
        'TicketTeamAssigned',
        'TicketTeamUnassigned',
        'TicketTrashed',
        'TicketUnassigned',
        'TicketUnmarkedSpam',
        'TicketUntrashed',
        'TicketUpdated',
        'TicketSlaPolicyAssigned',
    ]),
} as const)

export type TicketEventType = ValueOf<typeof TICKET_EVENT_TYPES>

export const SATISFACTION_SURVEY_EVENT_TYPES = Object.freeze({
    ..._pick(EventType, [
        'SatisfactionSurveyResponded',
        'SatisfactionSurveySent',
    ]),
} as const)

export type SatisfactionSurveyEventType = ValueOf<
    typeof SATISFACTION_SURVEY_EVENT_TYPES
>

export const SATISFACTION_SURVEY_DETAIL_EVENT_TYPES = Object.freeze({
    ..._omit(SATISFACTION_SURVEY_EVENT_TYPES, ['SatisfactionSurveyResponded']),
} as const)

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
    CsatAlreadySent = 'csat-already-sent',
    MissingHelpCenter = 'missing-help-center',
    NoAssignUserNotFound = 'user-not-found',
    NoEmailIntegrationNotFound = 'integration-not-found',
    NoEmailNoRecipient = 'no-recipient',
    NoReplyAutoSubmitted = 'auto-submitted',
    NoReplyNoReturnPath = 'no-return-path',
    NoReplyNotEmail = 'not-email',
    NoReplyRecent = 'recent-auto-reply',
    NoReplySpamTicket = 'spam-ticket',
    NoReplyToAgent = 'no-autoreply-no-nonagents',
    NoReplyUnanswerableChannel = 'unanswerable-channel',
    NoSnoozeClosedTicket = 'no-snooze-closed-ticket',
    NoSnoozePastDate = 'snooze-datetime-in-past',
    NoTeamAssignUserNotFound = 'team-not-found',
    TooManyRuleReplies = 'too-many-rule-replies',
    TooManyRuleMessagesToRecipient = 'too-many-rule-messages-to-recipient',
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
    [RuleActionFailureCauses.CsatAlreadySent]: {
        description: 'CSAT has already been sent for this ticket.',
        severity: RuleActionFailureSeverity.Error,
    },
    [RuleActionFailureCauses.MissingHelpCenter]: {
        description:
            'The connected help-center has either been deactivated or deleted.',
        severity: RuleActionFailureSeverity.Error,
    },
    [RuleActionFailureCauses.NoAssignUserNotFound]: {
        description: 'Could not find the agent to assign this ticket to.',
        severity: RuleActionFailureSeverity.Error,
    },
    [RuleActionFailureCauses.NoEmailIntegrationNotFound]: {
        description:
            'The integration used to send the email was deactivated or deleted.',
        severity: RuleActionFailureSeverity.Error,
    },
    [RuleActionFailureCauses.NoEmailNoRecipient]: {
        description: 'The recipient of the email was not specified.',
        severity: RuleActionFailureSeverity.Warning,
    },
    [RuleActionFailureCauses.NoReplyAutoSubmitted]: {
        description: 'Cannot auto-reply to an auto-generated message.',
        severity: RuleActionFailureSeverity.Warning,
    },
    [RuleActionFailureCauses.NoReplyNoReturnPath]: {
        description:
            'No return-path specified in the header of the previous message.',
        severity: RuleActionFailureSeverity.Warning,
    },
    [RuleActionFailureCauses.NoReplyNotEmail]: {
        description: 'Can only auto-reply to email messages.',
        severity: RuleActionFailureSeverity.Warning,
    },
    [RuleActionFailureCauses.NoReplyRecent]: {
        description:
            'Can only auto-reply to a given customer once every 5 minutes.',
        severity: RuleActionFailureSeverity.Warning,
    },
    [RuleActionFailureCauses.NoReplySpamTicket]: {
        description: 'Cannot auto-reply to a ticket marked as spam.',
        severity: RuleActionFailureSeverity.Warning,
    },
    [RuleActionFailureCauses.NoReplyToAgent]: {
        description: 'Can only auto-reply to customer messages.',
        severity: RuleActionFailureSeverity.Warning,
    },
    [RuleActionFailureCauses.NoReplyUnanswerableChannel]: {
        description: 'The channel of the previous message is not eligible.',
        severity: RuleActionFailureSeverity.Warning,
    },
    [RuleActionFailureCauses.NoSnoozeClosedTicket]: {
        description: 'Can only snooze an open ticket.',
        severity: RuleActionFailureSeverity.Warning,
    },
    [RuleActionFailureCauses.NoSnoozePastDate]: {
        description: 'Specified snooze date is in the past.',
        severity: RuleActionFailureSeverity.Warning,
    },
    [RuleActionFailureCauses.NoTeamAssignUserNotFound]: {
        description: 'Could not find the team to assign this ticket to.',
        severity: RuleActionFailureSeverity.Error,
    },
    [RuleActionFailureCauses.TooManyRuleReplies]: {
        description: 'Too many auto-replies have been sent by this rule.',
        severity: RuleActionFailureSeverity.Warning,
    },
    [RuleActionFailureCauses.TooManyRuleMessagesToRecipient]: {
        description:
            'Too many auto-replies have been sent to this recipient by this rule in the past hour.',
        severity: RuleActionFailureSeverity.Warning,
    },
}
