import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getSelectedAIMessage} from 'state/ui/ticketAIAgentFeedback'
import {useGetAiAgentFeedback} from 'models/aiAgentFeedback/queries'

import css from './AIAgentFeedbackBar.less'
import AIAgentMessageFeedback from './AIAgentMessageFeedback'
import AIAgentTicketFeedback from './AIAgentTicketFeedback'

export const FEEDBACK_TICKET_SUMMARY_TEST_ID = 'feedback-bar'
export const FEEDBACK_MESSAGE_CONTAINER_TEST_ID = 'feedback-message-container'

export const ticketFeedbackSummary =
    'Select a message from AI Agent and provide feedback to improve future responses.'

const AIAgentFeedbackBar = () => {
    const selectedAIMessage = useAppSelector(getSelectedAIMessage)

    const {data} = useGetAiAgentFeedback({
        refetchOnWindowFocus: false,
    })

    const ticketFeedback = data?.data

    const messageFeedback = selectedAIMessage
        ? ticketFeedback?.messages?.find(
              (messageFeedback) =>
                  messageFeedback.messageId === selectedAIMessage.id
          )
        : null

    return (
        <div
            className={css.container}
            data-testid={FEEDBACK_MESSAGE_CONTAINER_TEST_ID}
        >
            <div className={css.summaryContainer}>
                <div className={css.title}>
                    {messageFeedback ? 'Feedback' : 'Overview'}
                </div>
                <div
                    className={css.summary}
                    data-testid={FEEDBACK_TICKET_SUMMARY_TEST_ID}
                    dangerouslySetInnerHTML={{
                        __html: messageFeedback
                            ? messageFeedback?.summary
                            : ticketFeedback?.messages.length === 1
                            ? ticketFeedback.messages[0].summary
                            : ticketFeedbackSummary,
                    }}
                />
            </div>
            {messageFeedback ? (
                <AIAgentMessageFeedback messageFeedback={messageFeedback} />
            ) : (
                <AIAgentTicketFeedback ticketFeedback={ticketFeedback} />
            )}
        </div>
    )
}

export default AIAgentFeedbackBar
