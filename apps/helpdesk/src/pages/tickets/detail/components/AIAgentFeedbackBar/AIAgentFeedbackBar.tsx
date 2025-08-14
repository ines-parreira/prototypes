import { Button } from '@gorgias/axiom'

import { SegmentEvent } from 'common/segment'
import { logEventWithSampling } from 'common/segment/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useGetAiAgentFeedback } from 'models/aiAgentFeedback/queries'
import { getAIAgentMessages } from 'state/ticket/selectors'
import {
    changeTicketMessage,
    getSelectedAIMessage,
} from 'state/ui/ticketAIAgentFeedback'

import { useAIAgentResourcesWithFeedback } from '../../hooks/useAIAgentResourcesWithFeedback'
import AIAgentMessageFeedback from './AIAgentMessageFeedback'
import AIAgentTicketFeedback from './AIAgentTicketFeedback'
import useAiAgentMessageFeedback from './hooks/useAiAgentMessageFeedback'
import { ActionStatus } from './types'
import { isTrialMessageFromAIAgent } from './utils'

import css from './AIAgentFeedbackBar.less'

export const FEEDBACK_TICKET_SUMMARY_TEST_ID = 'feedback-bar'
export const FEEDBACK_MESSAGE_CONTAINER_TEST_ID = 'feedback-message-container'

export const ticketFeedbackSummary =
    'Select a message from AI Agent and provide feedback to improve future responses.'

const AIAgentFeedbackBar = () => {
    const dispatch = useAppDispatch()
    const aiMessages = useAppSelector(getAIAgentMessages)
    const publicAIMessages = aiMessages.filter((message) => message.public)

    const { data } = useGetAiAgentFeedback({
        refetchOnWindowFocus: false,
    })

    const ticketFeedback = data?.data

    const messageFeedback = useAiAgentMessageFeedback()
    const resourceWithFeedback =
        useAIAgentResourcesWithFeedback(messageFeedback)

    const selectedMessage = useAppSelector(getSelectedAIMessage)

    const isSelectedTrialMessage =
        !!selectedMessage && isTrialMessageFromAIAgent(selectedMessage)

    const handleSelectFirstMessage = () => {
        if (!ticketFeedback?.messages) return

        const messageWithFeedback = publicAIMessages.find((msg) =>
            ticketFeedback.messages.some((fb) => fb.messageId === msg.id),
        )

        if (messageWithFeedback) {
            dispatch(
                changeTicketMessage({
                    message: messageWithFeedback,
                }),
            )

            logEventWithSampling(
                SegmentEvent.AiAgentFeedbackFirstMessageButtonClicked,
                {},
            )
        }
    }

    const updateTicketMessageFeedbackSummary = (summary: string) => {
        if (
            resourceWithFeedback?.actions &&
            resourceWithFeedback?.actions.length > 0
        ) {
            // check if there is a action with type 'hard_action' and status 'not_confirmed'
            const hardAction = resourceWithFeedback.actions.find(
                (action) =>
                    action.type === 'hard_action' &&
                    action.status === ActionStatus.NOT_CONFIRMED,
            )

            if (hardAction) {
                return `AI Agent didn’t perform the "${hardAction.name}" Action because the customer didn’t confirm the action.`
            }
        }

        return summary
    }

    const getResponseSummary = () => {
        if (messageFeedback?.summary) {
            return updateTicketMessageFeedbackSummary(messageFeedback.summary)
        }

        const ticketMessageFeedbackSummary = ticketFeedback?.messages[0].summary

        return ticketFeedback?.messages.length === 1 &&
            ticketMessageFeedbackSummary !== undefined
            ? ticketMessageFeedbackSummary
            : ticketFeedbackSummary
    }

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
                            __html: getResponseSummary(),
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
