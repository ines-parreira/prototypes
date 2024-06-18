import React from 'react'
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

    const allowsFeedback = messageFeedback?.allowsFeedback

    // If message is not public, it is an internal note created by AI Agent
    const isMessagePublic = message.public

    const messageToDisplay = isMessagePublic
        ? messageFeedback?.summary
        : messageFeedback?.summary || <Body message={message} />

    if (!messageToDisplay) {
        return null
    }

    return (
        <AIBanner className={className}>
            <div
                className={classNames({
                    [css.boldMessage]: isMessagePublic,
                })}
            >
                {messageToDisplay}
            </div>
            {(true || allowsFeedback) && ( // TO DO: Remove the true condition. `allowsFeedback` is always false
                <AIAgentFeedback
                    message={message}
                    messageFeedback={messageFeedback}
                />
            )}
        </AIBanner>
    )
}

export default AIAgentBanner
