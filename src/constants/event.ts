export const RULE_EXECUTED = 'rule-executed'
export const TICKET_ASSIGNED = 'ticket-assigned'
export const TICKET_CLOSED = 'ticket-closed'
export const TICKET_CREATED = 'ticket-created'
export const TICKET_CUSTOMER_UPDATED = 'ticket-customer-updated'
export const TICKET_MARKED_SPAM = 'ticket-marked-spam'
export const TICKET_MERGED = 'ticket-merged'
export const TICKET_MESSAGE_CREATED = 'ticket-message-created'
export const TICKET_REOPENED = 'ticket-reopened'
export const TICKET_SNOOZED = 'ticket-snoozed'
export const TICKET_TAGS_ADDED = 'ticket-tags-added'
export const TICKET_TAGS_REMOVED = 'ticket-tags-removed'
export const TICKET_TEAM_ASSIGNED = 'ticket-team-assigned'
export const TICKET_TEAM_UNASSIGNED = 'ticket-team-unassigned'
export const TICKET_TRASHED = 'ticket-trashed'
export const TICKET_UNASSIGNED = 'ticket-unassigned'
export const TICKET_UNMARKED_SPAM = 'ticket-unmarked-spam'
export const TICKET_UNTRASHED = 'ticket-untrashed'
export const TICKET_UPDATED = 'ticket-updated'
export const TICKET_MESSAGE_SUMMARY_CREATED = 'ticket-message-summary-created'

export const INCOMING_PHONE_CALL = 'incoming-phone-call'
export const OUTGOING_PHONE_CALL = 'outgoing-phone-call'
export const COMPLETED_PHONE_CALL = 'completed-phone-call'
export const MISSED_PHONE_CALL = 'missed-phone-call'
export const VOICEMAIL_RECORDING = 'voicemail-recording'

//$TsFixMe fallback value for js, use TicketAuditLogEvent enum instead
export const TICKET_AUDIT_LOG_EVENTS_MAP = Object.freeze({
    RULE_EXECUTED,
    TICKET_ASSIGNED,
    TICKET_CLOSED,
    TICKET_CREATED,
    TICKET_CUSTOMER_UPDATED,
    TICKET_MARKED_SPAM,
    TICKET_MERGED,
    TICKET_REOPENED,
    TICKET_SNOOZED,
    TICKET_TAGS_ADDED,
    TICKET_TAGS_REMOVED,
    TICKET_TEAM_ASSIGNED,
    TICKET_TEAM_UNASSIGNED,
    TICKET_TRASHED,
    TICKET_UNASSIGNED,
    TICKET_UNMARKED_SPAM,
    TICKET_UNTRASHED,
    TICKET_MESSAGE_SUMMARY_CREATED,
})

export const TICKET_AUDIT_LOG_EVENTS = Object.freeze(
    Object.values(TICKET_AUDIT_LOG_EVENTS_MAP)
)

//$TsFixMe fallback value for js, use PhoneIntegrationEvent enum instead
export const PHONE_EVENTS_MAP = Object.freeze({
    INCOMING_PHONE_CALL,
    OUTGOING_PHONE_CALL,
    COMPLETED_PHONE_CALL,
    MISSED_PHONE_CALL,
    VOICEMAIL_RECORDING,
})

export const PHONE_EVENTS = Object.freeze(Object.values(PHONE_EVENTS_MAP))
