import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getSelectedAIMessage} from 'state/ui/ticketAIAgentFeedback'
import {getTicketState} from 'state/ticket/selectors'
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
    const ticket = useAppSelector(getTicketState)

    const ticketId = ticket.get('id') as number | undefined

    const {data} = useGetAiAgentFeedback(ticketId!, {
        refetchOnWindowFocus: false,
        enabled: !!ticketId,
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
                    {messageFeedback
                        ? 'Feedback'
                        : 'Improve AI Agent responses'}
                </div>
                <div
                    className={css.summary}
                    data-testid={FEEDBACK_TICKET_SUMMARY_TEST_ID}
                    dangerouslySetInnerHTML={{
                        __html: messageFeedback
                            ? messageFeedback?.summary
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
