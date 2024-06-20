import React, {useMemo} from 'react'
import classNames from 'classnames'
// import {useFlags} from 'launchdarkly-react-client-sdk'

// import {FeatureFlagKey} from 'config/featureFlags'
import {TicketMessage} from 'models/ticket/types'
import {useGetAiAgentFeedback} from 'models/aiAgentFeedback/queries'
import Body from 'pages/tickets/detail/components/TicketMessages/Body'

import css from './AIAgentBanner.less'
import AIBanner from './AIBanner'
import AIAgentFeedback from './AIAgentFeedback'

export type AIAgentBannerProps = {
    message: TicketMessage
    className?: string
}

const AIAgentBanner = ({message, className}: AIAgentBannerProps) => {
    // const isFeedbackToAiAgentV3Enabled =
    //     useFlags()[FeatureFlagKey.FeedbackToAIAgentInTicketViewsV3]

    const {data} = useGetAiAgentFeedback(message.ticket_id!, {
        refetchOnWindowFocus: false,
        enabled: message.ticket_id !== undefined,
    })

    const ticketFeedback = data?.data

    const messageFeedback = ticketFeedback?.messages?.find(
        (messageFeedback) => messageFeedback.messageId === message.id
    )

    // If message is not public, it is an internal note created by AI Agent
    const isMessagePublic = message.public

    const allowsFeedback = messageFeedback?.allowsFeedback || isMessagePublic

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
            <div
                data-testid="ai-agent-banner-message"
                className={classNames({
                    [css.boldMessage]: isMessagePublic,
                })}
            >
                {messageToDisplay}
            </div>
            {allowsFeedback && (
                <AIAgentFeedback
                    message={message}
                    messageFeedback={messageFeedback}
                />
            )}
        </AIBanner>
    )
}

export default AIAgentBanner
