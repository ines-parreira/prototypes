import React, { useEffect, useMemo } from 'react'

import { fromJS, Map } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'
import moment, { Moment } from 'moment'

import { SegmentEvent } from 'common/segment'
import { logEventWithSampling } from 'common/segment/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {
    isTicketMessageDeleted,
    isTicketMessageHidden,
} from 'models/ticket/predicates'
import { MessageMetadataType, TicketMessage } from 'models/ticket/types'
import { HighlightedElements } from 'pages/tickets/detail/components/AuditLogEvent'
import { AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS } from 'state/agents/constants'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { shouldDisplayAuditLogEvents as getShouldDisplayAuditLogEvents } from 'state/ticket/selectors'
import { buildFirstTicketMessage } from 'state/ticket/utils'
import { getSelectedAIMessage } from 'state/ui/ticketAIAgentFeedback'

import AIAgentDraftMessage from '../AIAgentDraftMessage/AIAgentDraftMessage'
import {
    BANNER_TYPE,
    DRAFT_MESSAGE_TAG,
    SAMPLE_RATE,
} from '../AIAgentFeedbackBar/constants'
import { isTrialMessageFromAIAgent } from '../AIAgentFeedbackBar/utils'
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
    messagePosition: number
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
    messagePosition,
}: Props) {
    const isFeedbackToAiAgentEnabled =
        useFlags()[FeatureFlagKey.FeedbackToAIAgentInTicketViews]

    const selectedAIMessage = useAppSelector(getSelectedAIMessage)
    const accountId = useAppSelector(getCurrentAccountId)

    const message = buildFirstTicketMessage(messages[0], id, ticketMeta)

    const shouldDisplayAuditLogEvents = useAppSelector(
        getShouldDisplayAuditLogEvents,
    )

    const isAIAgentMessage =
        isFeedbackToAiAgentEnabled &&
        AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS.includes(message.sender.email)

    const isAIAgentInternalNote = isAIAgentMessage && !message.public

    const isAIAgentDraftMessage = !!(
        message?.body_html &&
        message?.body_html.indexOf(DRAFT_MESSAGE_TAG) !== -1
    )

    // Used to transfer metadata from chat without displaying a message
    const isSignal = useMemo(() => {
        return message?.meta?.type === MessageMetadataType.Signal
    }, [message])

    const isAIAgentTrialMessage = isTrialMessageFromAIAgent(message)

    useEffect(() => {
        let bannerType = ''
        let sampleRate = SAMPLE_RATE

        if (isAIAgentMessage) {
            if (isAIAgentDraftMessage) {
                bannerType = BANNER_TYPE.QA_FAILED
                sampleRate = 1
            } else if (isAIAgentTrialMessage) {
                bannerType = BANNER_TYPE.TRIAL
                sampleRate = 1
            } else {
                bannerType = isAIAgentInternalNote
                    ? BANNER_TYPE.THUMBS_UP_AND_DOWN
                    : BANNER_TYPE.THUMBS_UP_IMPROVE_RESPONSE
            }
        }

        if (bannerType !== '') {
            logEventWithSampling(
                SegmentEvent.AiAgentTicketViewed,
                {
                    accountId,
                    banner: bannerType,
                },
                sampleRate,
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!messages.length) {
        return null
    }

    const groupAfterLastCustomerMessage = moment(message.sent_datetime).isAfter(
        lastCustomerMessage.get('sent_datetime'),
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
                    message.id! <= highlightedElements.last,
            )
            .indexOf(true) !== -1

    const containsLastCustomerMessage = messages.some((message) =>
        !lastCustomerMessage
            ? false
            : !!(
                  message.id &&
                  lastCustomerMessage.get('id') &&
                  message.id === lastCustomerMessage.get('id')
              ),
    )

    if (isAIAgentDraftMessage) {
        return (
            <AIAgentDraftMessage
                ticketId={ticketId}
                message={message}
                messages={messages}
            />
        )
    }

    if (isAIAgentTrialMessage) {
        return (
            <AIAgentDraftMessage
                ticketId={ticketId}
                message={message}
                messages={messages}
                isTrial
            />
        )
    }

    return (
        <Container
            id={id}
            isSignal={isSignal}
            message={message}
            messages={messages}
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
            isAIAgentMessageSelected={
                !!message.id && selectedAIMessage?.id === message.id
            }
            shouldDisplayAuditLogEvents={shouldDisplayAuditLogEvents}
            customer={customer}
            lastCustomerMessageDateTime={lastCustomerMessage.get(
                'sent_datetime',
            )}
        >
            {messages?.map((message: TicketMessage, index: number) => {
                return (
                    <Message
                        key={message.id || `${id}-${index}`}
                        message={message}
                        ticketId={ticketId}
                        setStatus={setStatus}
                        showSourceDetails={!!index}
                        timezone={timezone}
                        showMessageStatusIndicator={showMessageStatusIndicator}
                        isAIAgentMessage={isAIAgentMessage}
                        messagePosition={messagePosition}
                    />
                )
            })}
        </Container>
    )
}
