import React, { useMemo } from 'react'

import classNames from 'classnames'

import { useGetAiAgentFeedback } from 'models/aiAgentFeedback/queries'
import { TicketMessage } from 'models/ticket/types'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import Body from 'pages/tickets/detail/components/TicketMessages/Body'

import { useAIAgentResourcesWithFeedback } from '../../hooks/useAIAgentResourcesWithFeedback'
import { isTrialMessageFromAIAgent } from '../AIAgentFeedbackBar/utils'
import FailedWorkflowMessage from './AiAgentFailedWorkflowMessage'
import { getFailedWorkflowData } from './AiAgentFailedWorkflowMessage.util'
import AIAgentFeedback from './AIAgentFeedback'

import css from './AIAgentBanner.less'

export type AIAgentBannerProps = {
    message: TicketMessage
    messages: TicketMessage[]
    className?: string
}

const AIAgentBanner = ({
    message,
    messages,
    className,
}: AIAgentBannerProps) => {
    const { data } = useGetAiAgentFeedback({
        refetchOnWindowFocus: false,
    })

    const ticketFeedback = data?.data

    const lastMessageWithFeedback = useMemo(() => {
        if (!ticketFeedback?.messages) return null

        // Create a shallow copy before reversing to avoid mutating props
        const reversedMessages = [...messages].reverse()

        for (const message of reversedMessages) {
            const feedback = ticketFeedback.messages.find(
                (feedback) => feedback.messageId === message.id,
            )
            if (feedback) {
                return { message, feedback }
            }
        }

        return null
    }, [messages, ticketFeedback])

    const resourceWithFeedback = useAIAgentResourcesWithFeedback(
        lastMessageWithFeedback?.feedback,
    )

    // If message is not public, it is an internal note created by AI Agent
    const isMessagePublic = message.public

    const isTrialMessage = isTrialMessageFromAIAgent(message)

    const allowsFeedback =
        lastMessageWithFeedback?.feedback.allowsFeedback ||
        isMessagePublic ||
        isTrialMessage

    const { messageSummaryContainer, messageSummaryHasError } = useMemo(() => {
        const messageSummaryElement = document.createElement('div')
        messageSummaryElement.innerHTML =
            lastMessageWithFeedback?.feedback.summary || ''

        const messageSummaryHasError =
            messageSummaryElement.querySelector(
                '[data-error-summary="true"]',
            ) !== null

        const messageSummaryContainer = lastMessageWithFeedback?.feedback
            .summary ? (
            <div
                dangerouslySetInnerHTML={{
                    __html: lastMessageWithFeedback?.feedback.summary,
                }}
            />
        ) : null

        return {
            messageSummaryContainer,
            messageSummaryHasError,
        }
    }, [lastMessageWithFeedback?.feedback.summary])

    const messageToDisplay = isMessagePublic
        ? messageSummaryContainer
        : messageSummaryContainer || <Body message={message} />

    if (!messageToDisplay) {
        return null
    }

    const failedWorkflowData = getFailedWorkflowData(message)

    const twoStepMessageIndex = resourceWithFeedback?.actions.findIndex(
        (action) => action.type === 'hard_action' && action.status,
    )
    const currentMessageIndex =
        ticketFeedback?.messages.findIndex(
            (msg) => msg.messageId === message.id,
        ) || -1

    const isTwoStepMessage = twoStepMessageIndex === currentMessageIndex - 1

    const shouldDisplayAiAgentFeedback = allowsFeedback || isTwoStepMessage

    return (
        <AIBanner className={className} hasError={messageSummaryHasError}>
            {!isTrialMessage && (
                <div
                    className={classNames({
                        [css.boldMessage]: isMessagePublic,
                    })}
                >
                    {failedWorkflowData ? (
                        <FailedWorkflowMessage
                            workflowData={failedWorkflowData}
                            originalMessage={messageToDisplay}
                        />
                    ) : (
                        messageToDisplay
                    )}
                </div>
            )}
            {shouldDisplayAiAgentFeedback && (
                <AIAgentFeedback
                    message={lastMessageWithFeedback?.message || message}
                    messageFeedback={lastMessageWithFeedback?.feedback}
                    isTrialMessage={isTrialMessage}
                    isTwoStepMessage={isTwoStepMessage}
                />
            )}
        </AIBanner>
    )
}

export default AIAgentBanner
