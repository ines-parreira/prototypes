import { useCallback, useMemo } from 'react'

import { isSessionImpersonated } from '@repo/activity-tracker/utils'
import { logEvent, SegmentEvent } from '@repo/logging'
import { fromJS } from 'immutable'
import scrollIntoView from 'scroll-into-view-if-needed'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useGetAiAgentFeedback } from 'models/aiAgentFeedback/queries'
import type { MessageFeedback } from 'models/aiAgentFeedback/types'
import type { MacroAction } from 'models/macroAction/types'
import { MacroActionType } from 'models/macroAction/types'
import type { TicketMessage } from 'models/ticket/types'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { applyMacro, applyMacroAction } from 'state/ticket/actions'

type UseAiAgentDraftMessageArgs = {
    ticketId: number
    message: TicketMessage
    isTrial?: boolean
}

const AI_AGENT_MOCK_FEEDBACK_META_KEY = 'ai_agent_mock_feedback'
const SET_RESPONSE_TEXT_ACTION_NAME = 'setResponseText' as MacroAction['name']

function getAiAgentMockFeedbackFromMessage(
    message: TicketMessage,
): MessageFeedback | undefined {
    const meta = message.meta as Record<string, unknown> | null
    const feedback = meta?.[AI_AGENT_MOCK_FEEDBACK_META_KEY]

    return feedback as MessageFeedback | undefined
}

export function useAiAgentDraftMessage({
    ticketId,
    message,
    isTrial,
}: UseAiAgentDraftMessageArgs) {
    const accountId = useAppSelector(getCurrentAccountId)
    const { data, isLoading } = useGetAiAgentFeedback()
    const dispatch = useAppDispatch()
    const isImpersonated = useMemo(() => isSessionImpersonated(), [])

    const feedback = data?.data
    const mockFeedbackMessage = useMemo(
        () => getAiAgentMockFeedbackFromMessage(message),
        [message],
    )

    const feedbackMessage = useMemo<MessageFeedback | undefined>(() => {
        if (!message.id) {
            return undefined
        }

        return (
            feedback?.messages.find(
                (candidate) => candidate.messageId === message.id,
            ) ?? mockFeedbackMessage
        )
    }, [feedback, message.id, mockFeedbackMessage])

    const draftMessage = feedbackMessage?.draftMessage
    const feedbackWithFallback = useMemo(() => {
        if (feedback) {
            return feedback
        }

        if (!feedbackMessage) {
            return undefined
        }

        return {
            messages: [feedbackMessage],
        }
    }, [feedback, feedbackMessage])

    const handleCopyToEditor = useCallback(() => {
        const editorElement = document.getElementById('ticket-reply-editor')

        if (editorElement) {
            scrollIntoView(editorElement, {
                scrollMode: 'if-needed',
                behavior: 'smooth',
                block: 'nearest',
            })
        }

        logEvent(SegmentEvent.AiAgentCopiedToEditor, {
            accountId,
            banner: isTrial ? 'trial' : 'qa_failed',
        })

        if (!draftMessage) {
            return
        }

        dispatch(
            applyMacroAction(
                fromJS({
                    arguments: {
                        body_html: draftMessage.content,
                    },
                    name: SET_RESPONSE_TEXT_ACTION_NAME,
                    title: 'Set Response Text',
                    type: MacroActionType.User,
                }),
            ),
        )

        if (draftMessage.ticketActions) {
            void dispatch(
                applyMacro(
                    fromJS({
                        actions: draftMessage.ticketActions,
                    }),
                    ticketId,
                ),
            )
        }
    }, [accountId, dispatch, draftMessage, isTrial, ticketId])

    return {
        draftMessage,
        executionId: isImpersonated ? feedbackMessage?.executionId : undefined,
        feedback: feedbackWithFallback,
        feedbackMessage,
        handleCopyToEditor,
        isImpersonated,
        isLoading,
        summary: feedbackMessage?.summary ?? '',
    }
}
