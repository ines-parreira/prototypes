export const MONITORING_RESTRICTION_REASONS = {
    HANDLING_CALL: 'You cannot monitor your own live call.',
    CALL_HANDLED_BY_ADMIN: 'You cannot monitor a call handled by an Admin.',
    ALREADY_MONITORED:
        'This call is currently listened by another user. Try again later.',
    ANSWERED_BY_EXTERNAL_NUMBER:
        'Calls transferred to external numbers cannot be monitored.',
    TRANSFERRING_TO_QUEUE:
        'This call is currently being transferred to a queue. Try again later.',
    NOT_IN_PROGRESS: 'This call is currently in a queue. Try again later.',
    NOT_YET_CONNECTED: 'This call is not yet connected. Try again later.',
}
