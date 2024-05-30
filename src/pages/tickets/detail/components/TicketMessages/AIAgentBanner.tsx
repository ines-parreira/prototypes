import React from 'react'
import classNames from 'classnames'

import {TicketMessage} from 'models/ticket/types'
import {useGetAiAgentFeedback} from 'models/aiAgentFeedback/queries'
import Body from 'pages/tickets/detail/components/TicketMessages/Body'

import css from './AIAgentBanner.less'
import AIBanner from './AIBanner'
import AIAgentFeedback from './AIAgentFeedback'

export type AIAgentBannerProps = {
    message: TicketMessage
}

const AIAgentBanner = ({message}: AIAgentBannerProps) => {
    const {data, isLoading, isError} = useGetAiAgentFeedback(
        message.ticket_id!,
        {
            refetchOnWindowFocus: false,
        }
    )

    if (isLoading || isError) {
        return null
    }

    const ticketFeedback = data?.data

    const messageFeedback = ticketFeedback?.messages?.find(
        (messageFeedback) => messageFeedback.messageId === message.id
    )

    const allowsFeedback = messageFeedback?.allowsFeedback

    // If message is not public, it is an internal note created by AI Agent
    const isMessagePublic = message.public

    return (
        <AIBanner>
            <div className={classNames({[css.boldMessage]: isMessagePublic})}>
                {messageFeedback?.summary || <Body message={message} />}
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
