import classNames from 'classnames'
import React, {useMemo} from 'react'

import {useGetAiAgentFeedback} from 'models/aiAgentFeedback/queries'
import {TicketMessage} from 'models/ticket/types'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import Body from 'pages/tickets/detail/components/TicketMessages/Body'

import {isTrialMessageFromAIAgent} from '../AIAgentFeedbackBar/utils'
import css from './AIAgentBanner.less'
import AIAgentFeedback from './AIAgentFeedback'

export type AIAgentBannerProps = {
    message: TicketMessage
    messages: TicketMessage[]
    className?: string
}

const AIAgentBanner = ({message, messages, className}: AIAgentBannerProps) => {
    const {data} = useGetAiAgentFeedback({
        refetchOnWindowFocus: false,
    })

    const messageIds = useMemo(
        () => messages.map((message) => message.id),
        [messages]
    )

    const ticketFeedback = data?.data

    const messageFeedback = ticketFeedback?.messages
        // Creating a shallow copy to not mutate the original array
        ?.slice()
        // We want to get the last message that contains feedback
        ?.reverse()
        ?.find((messageFeedback) =>
            messageIds.includes(messageFeedback.messageId)
        )

    // If message is not public, it is an internal note created by AI Agent
    const isMessagePublic = message.public

    const isTrialMessage = isTrialMessageFromAIAgent(message)

    const allowsFeedback =
        messageFeedback?.allowsFeedback || isMessagePublic || isTrialMessage

    const {messageSummaryContainer, messageSummaryHasError} = useMemo(() => {
        const messageSummaryElement = document.createElement('div')
        messageSummaryElement.innerHTML = messageFeedback?.summary || ''

        const messageSummaryHasError =
            messageSummaryElement.querySelector(
                '[data-error-summary="true"]'
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
            {allowsFeedback && (
                <AIAgentFeedback
                    message={message}
                    messageFeedback={messageFeedback}
                    isTrialMessage={isTrialMessage}
                />
            )}
        </AIBanner>
    )
}

export default AIAgentBanner
