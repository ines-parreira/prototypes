import React, { useMemo } from 'react'

import classNames from 'classnames'

import { useGetAiAgentFeedback } from 'models/aiAgentFeedback/queries'
import { TicketMessage } from 'models/ticket/types'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import Body from 'pages/tickets/detail/components/TicketMessages/Body'

import { useAIAgentResourcesWithFeedback } from '../../hooks/useAIAgentResourcesWithFeedback'
import { isTrialMessageFromAIAgent } from '../AIAgentFeedbackBar/utils'
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

    const messageIds = useMemo(
        () => messages.map((message) => message.id),
        [messages],
    )

    const ticketFeedback = data?.data

    const messageFeedback = ticketFeedback?.messages
        // Creating a shallow copy to not mutate the original array
        ?.slice()
        // We want to get the last message that contains feedback
        ?.reverse()
        ?.find((messageFeedback) =>
            messageIds.includes(messageFeedback.messageId),
        )

    const resourceWithFeedback =
        useAIAgentResourcesWithFeedback(messageFeedback)

    // If message is not public, it is an internal note created by AI Agent
    const isMessagePublic = message.public

    const isTrialMessage = isTrialMessageFromAIAgent(message)

    const allowsFeedback =
        messageFeedback?.allowsFeedback || isMessagePublic || isTrialMessage

    const { messageSummaryContainer, messageSummaryHasError } = useMemo(() => {
        const messageSummaryElement = document.createElement('div')
        messageSummaryElement.innerHTML = messageFeedback?.summary || ''

        const messageSummaryHasError =
            messageSummaryElement.querySelector(
                '[data-error-summary="true"]',
            ) !== null

        const messageSummaryContainer = messageFeedback?.summary ? (
            <div
                dangerouslySetInnerHTML={{
                    __html: messageFeedback?.summary,
                }}
            />
        ) : null

        return {
            messageSummaryContainer,
            messageSummaryHasError,
        }
    }, [messageFeedback?.summary])

    const messageToDisplay = isMessagePublic
        ? messageSummaryContainer
        : messageSummaryContainer || <Body message={message} />

    if (!messageToDisplay) {
        return null
    }

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
                    {messageToDisplay}
                </div>
            )}
            {shouldDisplayAiAgentFeedback && (
                <AIAgentFeedback
                    message={message}
                    messageFeedback={messageFeedback}
                    isTrialMessage={isTrialMessage}
                    isTwoStepMessage={isTwoStepMessage}
                />
            )}
        </AIBanner>
    )
}

export default AIAgentBanner
