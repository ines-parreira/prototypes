import React from 'react'
import moment, {Moment} from 'moment'
import {fromJS, Map} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {
    isTicketMessageDeleted,
    isTicketMessageHidden,
} from 'models/ticket/predicates'
import {TicketMessage} from 'models/ticket/types'
import {HighlightedElements} from 'pages/tickets/detail/components/AuditLogEvent'

import {shouldDisplayAuditLogEvents as getShouldDisplayAuditLogEvents} from 'state/ticket/selectors'
import {buildFirstTicketMessage} from 'state/ticket/utils'
import {AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS} from 'state/agents/constants'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {getSelectedAIMessage} from 'state/ui/ticketAIAgentFeedback'
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
    highlightedElements: HighlightedElements | null
    customer: Map<any, any>
    lastCustomerMessage: Map<any, any>
    ticketMeta: Map<any, any> | null
}

export default function TicketMessages({
    id,
    messages,
    ticketId,
    timezone,
    hasCursor,
    lastMessageDatetimeAfterMount,
    setStatus,
    highlightedElements,
    lastCustomerMessage,
    customer = fromJS({}),
    ticketMeta,
}: Props) {
    const isFeedbackToAiAgentEnabled =
        useFlags()[FeatureFlagKey.FeedbackToAIAgentInTicketViews]

    const selectedAIMessage = useAppSelector(getSelectedAIMessage)

    const message = buildFirstTicketMessage(messages[0], id, ticketMeta)

    const shouldDisplayAuditLogEvents = useAppSelector(
        getShouldDisplayAuditLogEvents
    )

    if (!messages.length) {
        return null
    }

    const isAIAgentMessage =
        isFeedbackToAiAgentEnabled &&
        message.sender.email === AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS

    const isAIAgentInternalNote = isAIAgentMessage && !message.public

    const groupAfterLastCustomerMessage = moment(message.sent_datetime).isAfter(
        lastCustomerMessage.get('sent_datetime')
    )

    const showMessageStatusIndicator =
        !!message.opened_datetime &&
        messages.some((message) => message.opened_datetime === null)

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
            containsLastCustomerMessage={containsLastCustomerMessage}
            displayMessageStatusIndicator={groupAfterLastCustomerMessage}
            isMessageHidden={isTicketMessageHidden(message)}
            isMessageDeleted={isTicketMessageDeleted(message)}
            isBodyHighlighted={containerContainsHighlightedMessages}
            isAIAgentInternalNote={isAIAgentInternalNote}
            isAIAgentMessage={isAIAgentMessage}
            isAIAgentMessageSelected={selectedAIMessage?.id === message.id}
            shouldDisplayAuditLogEvents={shouldDisplayAuditLogEvents}
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
                    timezone={timezone}
                    showMessageStatusIndicator={showMessageStatusIndicator}
                />
            ))}
        </Container>
    )
}
