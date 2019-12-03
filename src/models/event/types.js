// @flow

import {TICKET_AUDIT_LOG_EVENTS} from '../../constants/event'

export type TicketTagsAddedEventData = {
    tags_added: Array<number>,
}

export type TicketTagsRemovedEventData = {
    tags_removed: Array<number>,
}

export type TicketAssignedEventData = {
    assignee_user_id: number,
}

export type TicketTeamAssignedEventData = {
    assignee_team_id: number,
}

export type RuleExecutedEventData = {
    id: number,
    uri: string,
    code: string,
    name: string,
    type: string,
    priority: number,
    schedule: ?string,
    description: ?string,
    event_types: string,
    created_datetime: string,
    updated_datetime: string,
    deactivated_datetime: ?string,
}

export type AuditLogEventData =
    | TicketTagsAddedEventData
    | TicketTagsRemovedEventData
    | TicketAssignedEventData
    | TicketTeamAssignedEventData
    | RuleExecutedEventData

export type AuditLogEventObjectType =
    | 'Customer'
    | 'Tag'
    | 'TicketMessage'
    | 'Ticket'
    | 'User'

export type AuditLogEventType = $Values<TICKET_AUDIT_LOG_EVENTS>

export type AuditLogEvent = {
    id: number,
    account_id: number,
    user_id: ?number,
    object_type: AuditLogEventObjectType,
    object_id: number,
    data: ?AuditLogEventData,
    context: string,
    type: AuditLogEventType,
    created_datetime: string,
}
