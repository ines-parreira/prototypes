import { useEffect, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { logEventWithSampling, SegmentEvent } from '@repo/logging'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import type { Moment } from 'moment'

import { useTicketIsAfterFeedbackCollectionPeriod } from 'common/utils/useIsTicketAfterFeedbackCollectionPeriod'
import useAppSelector from 'hooks/useAppSelector'
import { useGetEarliestExecution } from 'models/knowledgeService/queries'
import {
    isTicketMessageDeleted,
    isTicketMessageHidden,
} from 'models/ticket/predicates'
import type { TicketMessage as TicketMessage_DEPRECATED } from 'models/ticket/types'
import type { HighlightedElements } from 'pages/tickets/detail/components/AuditLogEvent'
import { isSessionImpersonated } from 'services/activityTracker/utils'
import { AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS } from 'state/agents/constants'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { shouldDisplayAuditLogEvents as getShouldDisplayAuditLogEvents } from 'state/ticket/selectors'
import { buildFirstTicketMessage } from 'state/ticket/utils'
import { getSelectedAIMessage } from 'state/ui/ticketAIAgentFeedback'
import { getActiveView } from 'state/views/selectors'

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
    messages: TicketMessage_DEPRECATED[]
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

const CACHE_TIME = 1000 * 60 * 60 * 1 // 1 hour

export default function TicketMessages({
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
    const isFeedbackToAiAgentEnabled = useFlag(
        FeatureFlagKey.FeedbackToAIAgentInTicketViews,
    )
    const isTicketAfterFeedbackCollectionPeriod =
        useTicketIsAfterFeedbackCollectionPeriod()

    const { data: earliestExecution } = useGetEarliestExecution({
        refetchOnWindowFocus: false,
        cacheTime: CACHE_TIME,
        staleTime: Infinity, // The earliest execution is not updated so getting it once is enough.
    })

    const isImpersonated = useMemo(() => isSessionImpersonated(), [])

    const selectedAIMessage = useAppSelector(getSelectedAIMessage)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector((state) => state.currentUser)
    const activeView = useAppSelector(getActiveView)

    const accountId: number = currentAccount.get('id')
    const userType: string = currentUser.get('role').get('name')
    const viewType: string = activeView.get('slug')

    const message = buildFirstTicketMessage(
        messages[0],
        messagePosition,
        ticketMeta,
    )

    const shouldTicketHaveReasoning = useMemo(() => {
        if (!earliestExecution) return null
        if (!earliestExecution.reasoningTimestamp) return false
        const messageDate = new Date(message.created_datetime)
        return (
            messageDate.getTime() >
            new Date(earliestExecution.reasoningTimestamp).getTime()
        )
    }, [earliestExecution, message.created_datetime])

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
                    viewedFrom: viewType,
                    userType,
                },
                sampleRate,
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!messages.length) {
        return null
    }

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
        return <AIAgentDraftMessage ticketId={ticketId} message={message} />
    }

    if (isAIAgentTrialMessage) {
        return (
            <AIAgentDraftMessage
                ticketId={ticketId}
                message={message}
                isTrial
            />
        )
    }

    return (
        <Container
            ticketId={ticketId}
            message={message}
            messages={messages}
            hasCursor={hasCursor}
            lastMessageDatetimeAfterMount={lastMessageDatetimeAfterMount}
            timezone={timezone}
            containsLastCustomerMessage={containsLastCustomerMessage}
            isMessageHidden={isTicketMessageHidden(message)}
            isMessageDeleted={isTicketMessageDeleted(message)}
            isBodyHighlighted={containerContainsHighlightedMessages}
            isAIAgentInternalNote={isAIAgentInternalNote}
            isAIAgentMessage={isAIAgentMessage}
            isAIAgentMessageSelected={
                !!message.id && selectedAIMessage?.id === message.id
            }
            isTicketAfterFeedbackCollectionPeriod={
                isTicketAfterFeedbackCollectionPeriod
            }
            shouldTicketHaveReasoning={shouldTicketHaveReasoning}
            shouldDisplayAuditLogEvents={shouldDisplayAuditLogEvents}
            customer={customer}
            lastCustomerMessageDateTime={lastCustomerMessage.get(
                'sent_datetime',
            )}
            isImpersonated={isImpersonated}
        >
            {messages?.map(
                (message: TicketMessage_DEPRECATED, index: number) => {
                    return (
                        <Message
                            key={
                                message.id ||
                                `message-${messagePosition}-${index}`
                            }
                            message={message}
                            ticketId={ticketId}
                            setStatus={setStatus}
                            showSourceDetails={!!index}
                            isAIAgentMessage={isAIAgentMessage}
                            messagePosition={messagePosition}
                        />
                    )
                },
            )}
        </Container>
    )
}
