import React from 'react'
import moment, {Moment} from 'moment'

import {fromJS, Map} from 'immutable'

import {
    isTicketMessageDeleted,
    isTicketMessageHidden,
} from 'models/ticket/predicates'
import {TicketMessage} from 'models/ticket/types'
import {HighlightedElements} from 'pages/tickets/detail/components/AuditLogEvent'

import Container from './Container'
import Message from './Message'

type Props = {
    id: string
    messages: TicketMessage[]
    ticketId: number
    timezone: string
    hasCursor: boolean
    lastMessageDatetimeAfterMount: Moment | null
    setStatus?: (status: string) => void
    lastReadMessageId?: number
    lastSentMessageIdFromAgent?: number
    highlightedElements: HighlightedElements | null
    customer: Map<any, any>
    lastCustomerMessage: Map<any, any>
}

export default function TicketMessages({
    id,
    messages,
    ticketId,
    timezone,
    hasCursor,
    lastMessageDatetimeAfterMount,
    setStatus,
    lastReadMessageId,
    highlightedElements,
    lastCustomerMessage,
    customer = fromJS({}),
}: Props) {
    if (!messages.length) {
        return null
    }

    const message = messages[0]

    const groupAfterLastCustomerMessage = moment(message.sent_datetime).isAfter(
        lastCustomerMessage.get('sent_datetime')
    )

    const showMessageStatusIndicator =
        !!message.opened_datetime &&
        messages.some((message) => message.opened_datetime === null)

    const isLastReadMessage = !!(
        message.id &&
        lastReadMessageId &&
        message.id === lastReadMessageId
    )

    const containerContainsHighlightedMessages =
        messages
            .map(
                (message) =>
                    highlightedElements &&
                    message.from_agent &&
                    !isNaN(message.id!) &&
                    highlightedElements.first <= message.id! &&
                    message.id! <= highlightedElements.last
            )
            .indexOf(true) !== -1

    const containsLastCustomerMessage = messages.some((message) =>
        !lastCustomerMessage
            ? false
            : !!(
                  message.id &&
                  lastCustomerMessage.get('id') &&
                  message.id === lastCustomerMessage.get('id')
              )
    )

    return (
        <Container
            id={id}
            message={message}
            hasCursor={hasCursor}
            lastMessageDatetimeAfterMount={lastMessageDatetimeAfterMount}
            timezone={timezone}
            isLastRead={isLastReadMessage}
            containsLastCustomerMessage={containsLastCustomerMessage}
            displayMessageStatusIndicator={groupAfterLastCustomerMessage}
            isMessageHidden={isTicketMessageHidden(message)}
            isMessageDeleted={isTicketMessageDeleted(message)}
            isBodyHighlighted={containerContainsHighlightedMessages}
            customer={customer}
            lastCustomerMessageDateTime={lastCustomerMessage.get(
                'sent_datetime'
            )}
        >
            {messages.map((message: TicketMessage, index: number) => (
                <Message
                    key={message.id || `${id}-${index}`}
                    message={message}
                    ticketId={ticketId}
                    setStatus={setStatus}
                    showSourceDetails={!!index}
                    isLastRead={isLastReadMessage}
                    timezone={timezone}
                    showMessageStatusIndicator={showMessageStatusIndicator}
                />
            ))}
        </Container>
    )
}
