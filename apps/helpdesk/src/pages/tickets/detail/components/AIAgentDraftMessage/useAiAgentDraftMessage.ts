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

const SET_RESPONSE_TEXT_ACTION_NAME = 'setResponseText' as MacroAction['name']

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

    const feedbackMessage = useMemo<MessageFeedback | undefined>(() => {
        if (!message.id) {
            return undefined
        }

        return feedback?.messages.find(
            (candidate) => candidate.messageId === message.id,
        )
    }, [feedback, message.id])

    const draftMessage = feedbackMessage?.draftMessage

    const copyDraftToEditor = useCallback(
        (includeTicketActions: boolean) => {
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

            if (includeTicketActions && draftMessage.ticketActions) {
                void dispatch(
                    applyMacro(
                        fromJS({
                            actions: draftMessage.ticketActions,
                        }),
                        ticketId,
                    ),
                )
            }
        },
        [accountId, dispatch, draftMessage, isTrial, ticketId],
    )

    const handleCopyMessageToEditor = useCallback(() => {
        copyDraftToEditor(false)
    }, [copyDraftToEditor])

    const handleCopyMessageAndActionsToEditor = useCallback(() => {
        copyDraftToEditor(true)
    }, [copyDraftToEditor])

    return {
        draftMessage,
        executionId: isImpersonated ? feedbackMessage?.executionId : undefined,
        feedback,
        feedbackMessage,
        handleCopyMessageAndActionsToEditor,
        handleCopyMessageToEditor,
        isImpersonated,
        isLoading,
        summary: feedbackMessage?.summary ?? '',
    }
}
