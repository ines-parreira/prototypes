export const MONITORING_RESTRICTION_REASONS = {
    HANDLING_CALL: 'You cannot monitor your own live call.',
    CALL_HANDLED_BY_ADMIN: 'You cannot monitor a call handled by an Admin.',
    OTHER_AGENT_MONITORING_CALL:
        'This call is currently listened by another user. Try again later.',
    CALL_ANSWERED_BY_EXTERNAL_NUMBER:
        'Calls transferred to external numbers cannot be monitored.',
    TRANSFERRING_TO_QUEUE:
        'This call is currently being transferred to a queue. Try again later.',
    CALL_NOT_IN_PROGRESS: 'This call is currently in a queue. Try again later.',
    CALL_NOT_YET_CONNECTED: 'This call is not yet connected. Try again later.',
    // for errors sent by the backend, for completeness
    NOT_ALLOWED: "You don't have the permissions to monitor a call.",
    CALL_COMPLETED: 'You cannot monitor a call that is already completed.',
    ALREADY_MONITORING_CALL: 'You are already monitoring this call.',
    AGENT_BUSY: 'You cannot monitor a call while handling another.',
    GENERIC: 'You cannot monitor this call.',
}
