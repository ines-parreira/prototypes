import React from 'react'

import {TicketVia} from 'business/types/ticket'

import {SegmentEvent} from 'common/segment'
import {logEventWithSampling} from 'common/segment/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {useGetAiAgentFeedback} from 'models/aiAgentFeedback/queries'

import Button from 'pages/common/components/button/Button'
import {getAIAgentMessages} from 'state/ticket/selectors'
import {
    changeTicketMessage,
    getSelectedAIMessage,
} from 'state/ui/ticketAIAgentFeedback'

import css from './AIAgentFeedbackBar.less'
import AIAgentMessageFeedback from './AIAgentMessageFeedback'
import AIAgentTicketFeedback from './AIAgentTicketFeedback'
import useAiAgentMessageFeedback from './hooks/useAiAgentMessageFeedback'
import {isTrialMessageFromAIAgent} from './utils'

export const FEEDBACK_TICKET_SUMMARY_TEST_ID = 'feedback-bar'
export const FEEDBACK_MESSAGE_CONTAINER_TEST_ID = 'feedback-message-container'

export const ticketFeedbackSummary =
    'Select a message from AI Agent and provide feedback to improve future responses.'

const AIAgentFeedbackBar = () => {
    const dispatch = useAppDispatch()
    const aiMessages = useAppSelector(getAIAgentMessages)
    const publicAIMessages = aiMessages.filter((message) => message.public)

    const {data} = useGetAiAgentFeedback({
        refetchOnWindowFocus: false,
    })

    const ticketFeedback = data?.data

    const messageFeedback = useAiAgentMessageFeedback()

    const selectedMessage = useAppSelector(getSelectedAIMessage)

    const isSelectedTrialMessage =
        !!selectedMessage && isTrialMessageFromAIAgent(selectedMessage)

    const handleSelectFirstMessage = () => {
        dispatch(
            changeTicketMessage({
                message: publicAIMessages.find(
                    (message) => message.via === TicketVia.Api
                ),
            })
        )
        logEventWithSampling(
            SegmentEvent.AiAgentFeedbackFirstMessageButtonClicked,
            {}
        )
    }

    const ticketMessageFeedbackSummary = ticketFeedback?.messages[0].summary

    return (
        <>
            {!isSelectedTrialMessage && (
                <div className={css.summaryContainer}>
                    <div className={css.title}>
                        {messageFeedback
                            ? 'Response summary'
                            : 'AI Agent overview'}
                    </div>
                    <div
                        className={css.summary}
                        data-testid={FEEDBACK_TICKET_SUMMARY_TEST_ID}
                        dangerouslySetInnerHTML={{
                            __html: messageFeedback?.summary
                                ? messageFeedback.summary
                                : ticketFeedback?.messages.length === 1 &&
                                    ticketMessageFeedbackSummary !== undefined
                                  ? ticketMessageFeedbackSummary
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
            )}
            {messageFeedback ? (
                <AIAgentMessageFeedback messageFeedback={messageFeedback} />
            ) : (
                <AIAgentTicketFeedback ticketFeedback={ticketFeedback} />
            )}
        </>
    )
}

export default AIAgentFeedbackBar
