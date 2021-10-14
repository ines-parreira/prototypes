import React from 'react'
import {fromJS} from 'immutable'

import {TicketMessage} from '../../../../../models/ticket/types'
import {TicketMessageSourceType} from '../../../../../business/types/ticket'

import Error from './Error'

type Props = {
    message: TicketMessage
    ticketId: number
    loading: boolean
    hasActionError: boolean
    setStatus?: (status: string) => void
}

const Errors = (props: Props) => {
    const {message, loading, hasActionError, ticketId, setStatus} = props

    if (
        [
            TicketMessageSourceType.YotpoReviewPublicComment,
            TicketMessageSourceType.YotpoReviewPrivateComment,
        ].includes(message.source!.type) &&
        message.last_sending_error &&
        message.last_sending_error.error === 'Review already has a comment'
    ) {
        message.is_retriable = false
    }

    return (
        <>
            {!loading && hasActionError && (
                // @ts-ignore
                <Error
                    key="action-error"
                    error="This message was not sent because one or more actions failed while sending it."
                    retryTooltipMessage="Retry to execute the failed action(s) automatically, and send the message if it succeeds."
                    messageId={message.id!}
                    ticketId={message.ticket_id || ticketId}
                    messageActions={message.actions!}
                    retry
                    force
                    cancel
                />
            )}
            {!loading && message.failed_datetime && (
                <Error
                    key="error"
                    error={
                        message.last_sending_error &&
                        message.last_sending_error.error
                            ? message.last_sending_error.error
                            : 'This message was not sent.'
                    }
                    message={fromJS(message)}
                    messageId={message.id!}
                    ticketId={message.ticket_id || ticketId}
                    setStatus={setStatus}
                    retry={message.is_retriable}
                    cancel
                />
            )}
        </>
    )
}

export default Errors
