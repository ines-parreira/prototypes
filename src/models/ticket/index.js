export * from './types.js'
export {
    isTicketMessage,
    isTicketEvent,
    isTicketSatisfactionSurvey,
    hasFailedAction,
    hasPendingAction,
    isPending,
    isFailed,
    isTicketMessageHidden,
    isTicketMessageDeleted,
} from './predicates.ts'
