import { reportError } from '@repo/logging'

import type { NewMessage } from './types'

export type TicketMessageSubmissionDiagnosticsStage =
    | 'submit_click'
    | 'after_prepare'
    | 'pending_send_scheduled'
    | 'pending_send_flushed'
    | 'pending_send_timeout'
    | 'request_boundary'
    | 'request_response'

export type TicketMessageSubmissionDiagnosticsContext = Record<string, unknown>

export const ticketMessageSubmissionIdentityReportingEnabledContextKey =
    'ticket_message_submission_identity_reporting_enabled'

const ticketMessageSubmissionMismatchFingerprint = [
    'ticket-message-submission-identity-mismatch',
]

const isComparableTicketId = (ticketId: unknown) =>
    ticketId !== undefined &&
    ticketId !== null &&
    ticketId !== '' &&
    ticketId !== 'new' &&
    !Number.isNaN(Number(ticketId))

export const haveDifferentTicketIds = (
    firstTicketId: unknown,
    secondTicketId: unknown,
) =>
    isComparableTicketId(firstTicketId) &&
    isComparableTicketId(secondTicketId) &&
    Number(firstTicketId) !== Number(secondTicketId)

export const getTicketMessageDiagnostics = (
    messageToSend?: Partial<NewMessage>,
) => ({
    ticket_id_new_message: messageToSend?.ticket_id,
    source_type: messageToSend?.source?.type,
    channel: messageToSend?.channel,
})

export const getBrowserTicketSubmissionDiagnostics = () => ({
    pathname:
        typeof window !== 'undefined' ? window.location.pathname : undefined,
    search: typeof window !== 'undefined' ? window.location.search : undefined,
    title: typeof document !== 'undefined' ? document.title : undefined,
    document_ready_state:
        typeof document !== 'undefined' ? document.readyState : undefined,
    page_hidden: typeof document !== 'undefined' ? document.hidden : undefined,
    page_visible:
        typeof document !== 'undefined' ? !document.hidden : undefined,
})

export const reportTicketMessageSubmissionIdentityMismatch = (
    stage: TicketMessageSubmissionDiagnosticsStage,
    context: TicketMessageSubmissionDiagnosticsContext,
) => {
    if (
        context[ticketMessageSubmissionIdentityReportingEnabledContextKey] !==
        true
    ) {
        return
    }

    reportError(
        new Error('Ticket message submission identity mismatch.'),
        {
            extra: {
                stage,
                ...context,
            },
        },
        [...ticketMessageSubmissionMismatchFingerprint, stage],
    )
}
