import type { TicketMessage } from '@gorgias/helpdesk-queries'

import { TicketMessageError, YotpoCommentGuideLink } from './TicketMessageError'
import { getMessageErrorState } from './utils/getMessageErrorState'
import { hasFailedAction, isMessagePending } from './utils/messageErrorActions'

type MessageErrorsProps = {
    message: TicketMessage
    ticketId: number
    isPending?: boolean
    failedMessageError?: string
}

export function MessageErrors({
    message,
    ticketId,
    isPending,
    failedMessageError,
}: MessageErrorsProps) {
    const loading = isMessagePending({
        actions: message.actions,
        isPending,
        source: message.source,
    })
    const hasActionError = hasFailedAction(message)
    const messageErrorState = getMessageErrorState(message)

    return (
        <>
            {!loading && hasActionError ? (
                <TicketMessageError
                    error="Message not sent because action failed."
                    isCancelable
                    isForceable
                    message={message}
                    messageActions={message.actions}
                    messageId={message.id}
                    isRetriable
                    retryTooltipMessage="Retry to execute the failed action automatically, and send the message if it succeeds."
                    ticketId={message.ticket_id || ticketId}
                />
            ) : null}
            {!loading && message.failed_datetime ? (
                <TicketMessageError
                    error={
                        messageErrorState.isYotpoDuplicateCommentError ? (
                            <YotpoCommentGuideLink />
                        ) : (
                            (failedMessageError ??
                            messageErrorState.errorMessage)
                        )
                    }
                    isCancelable
                    message={message}
                    messageId={message.id}
                    isRetriable={messageErrorState.isRetriable}
                    ticketId={message.ticket_id || ticketId}
                />
            ) : null}
        </>
    )
}
