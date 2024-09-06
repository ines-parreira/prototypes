import React from 'react'

import {AutoQA} from 'auto_qa'
import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {
    changeTicketMessage,
    getSelectedAIMessage,
} from 'state/ui/ticketAIAgentFeedback'
import {useGetAiAgentFeedback} from 'models/aiAgentFeedback/queries'
import Button from 'pages/common/components/button/Button'

import useAppDispatch from 'hooks/useAppDispatch'
import {getAIAgentMessages} from 'state/ticket/selectors'
import {logEventWithSampling} from 'common/segment/segment'
import {SegmentEvent} from 'common/segment'
import AIAgentMessageFeedback from './AIAgentMessageFeedback'
import AIAgentTicketFeedback from './AIAgentTicketFeedback'
import css from './AIAgentFeedbackBar.less'

export const FEEDBACK_TICKET_SUMMARY_TEST_ID = 'feedback-bar'
export const FEEDBACK_MESSAGE_CONTAINER_TEST_ID = 'feedback-message-container'

export const ticketFeedbackSummary =
    'Select a message from AI Agent and provide feedback to improve future responses.'

const AIAgentFeedbackBar = () => {
    const hasAutoQA = useFlag<boolean>(FeatureFlagKey.AutoQA, false)
    const dispatch = useAppDispatch()
    const selectedAIMessage = useAppSelector(getSelectedAIMessage)

    const aiMessages = useAppSelector(getAIAgentMessages)

    const publicAIMessages = aiMessages.filter((message) => message.public)

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

    const handleSelectFirstMessage = () => {
        dispatch(changeTicketMessage({message: publicAIMessages[0]}))
        logEventWithSampling(
            SegmentEvent.AiAgentFeedbackFirstMessageButtonClicked,
            {}
        )
    }

    return (
        <div
            className={css.container}
            data-testid={FEEDBACK_MESSAGE_CONTAINER_TEST_ID}
        >
            {hasAutoQA && <AutoQA />}
            <div className={css.summaryContainer}>
                <div className={css.title}>
                    {messageFeedback ? 'Response summary' : 'Ticket overview'}
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
                {aiMessages.length > 1 && !messageFeedback && (
                    <div className={css.selectFirstMessageWrapper}>
                        <Button onClick={handleSelectFirstMessage}>
                            Select First Message
                        </Button>
                    </div>
                )}
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
