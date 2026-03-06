import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    aiAgentFeedbackKeys,
    useDeleteAIAgentTicketMessagesFeedback,
    useSubmitAIAgentTicketMessagesFeedback,
} from 'models/aiAgentFeedback/queries'
import type {
    DeleteMessageFeedback,
    SubmitMessageFeedback,
    TicketFeedback,
} from 'models/aiAgentFeedback/types'
import type { TicketMessage } from 'models/ticket/types'
import { setAgentFeedbackMessageStatus } from 'state/agents/actions'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { getAIAgentMessages } from 'state/ticket/selectors'

import type { ResourceSection } from '../components/AIAgentFeedbackBar/types'
import { FeedbackStatus } from '../components/AIAgentFeedbackBar/types'

export const useAIAgentSendFeedback = () => {
    const aiMessages = useAppSelector(getAIAgentMessages)
    const messageIds = aiMessages.map((message) => message.id) as number[]
    const queryKey = aiAgentFeedbackKeys.detail(messageIds)

    const { mutateAsync: submitAIAgentTicketMessagesFeedback } =
        useSubmitAIAgentTicketMessagesFeedback<{
            previousFeedback: AxiosResponse<TicketFeedback, any> | undefined
        }>({
            onMutate: async (params) => {
                const [messageId, feedback] = params

                await queryClient.cancelQueries({
                    queryKey,
                })

                const previousFeedback =
                    queryClient.getQueryData<
                        AxiosResponse<TicketFeedback, any>
                    >(queryKey)

                if (previousFeedback) {
                    queryClient.setQueryData<
                        AxiosResponse<TicketFeedback, any>
                    >(queryKey, {
                        ...previousFeedback,
                        data: {
                            messages: previousFeedback.data.messages.map(
                                (message) => {
                                    if (message.messageId === messageId) {
                                        return {
                                            ...message,
                                            feedbackOnMessage: [
                                                ...feedback.feedbackOnMessage,
                                                ...message.feedbackOnMessage,
                                            ],
                                            feedbackOnResource: [
                                                ...feedback.feedbackOnResource,
                                                ...message.feedbackOnResource,
                                            ],
                                        }
                                    }
                                    return message
                                },
                            ),
                        },
                    })
                }

                return { previousFeedback }
            },
            onError: (error, variables, context) => {
                if (context) {
                    queryClient.setQueryData<
                        AxiosResponse<TicketFeedback, any>
                    >(
                        aiAgentFeedbackKeys.detail(messageIds),
                        context.previousFeedback,
                    )
                }

                void dispatch(
                    notify({
                        message:
                            'There was an error sending the feedback. Please try again.',
                        status: NotificationStatus.Error,
                    }),
                )

                const [, , resourceSection] = variables
                if (resourceSection) {
                    dispatch(
                        setAgentFeedbackMessageStatus(
                            FeedbackStatus.ERROR,
                            resourceSection,
                        ),
                    )
                }
            },
            onSuccess: (_, variables) => {
                void queryClient.invalidateQueries({
                    queryKey: aiAgentFeedbackKeys.detail(messageIds),
                })

                const [, , resourceSection] = variables
                if (resourceSection) {
                    dispatch(
                        setAgentFeedbackMessageStatus(
                            FeedbackStatus.SAVED,
                            resourceSection,
                        ),
                    )
                }
            },
        })

    const { mutateAsync: deleteAIAgentTicketMessagesFeedback } =
        useDeleteAIAgentTicketMessagesFeedback({
            onSuccess: () => {
                void queryClient.invalidateQueries({
                    queryKey: aiAgentFeedbackKeys.detail(messageIds),
                })
            },
            onError: () => {
                void dispatch(
                    notify({
                        message:
                            'There was an error deleting the feedback. Please try again.',
                        status: NotificationStatus.Error,
                    }),
                )
            },
        })

    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()

    const aiAgentSendFeedback = async (
        message: TicketMessage,
        payload: SubmitMessageFeedback,
        resourceSection?: ResourceSection,
    ) => {
        if (resourceSection) {
            dispatch(
                setAgentFeedbackMessageStatus(
                    FeedbackStatus.SAVING,
                    resourceSection,
                ),
            )
        }

        await submitAIAgentTicketMessagesFeedback([
            message.id!,
            payload,
            resourceSection,
        ])
    }

    const aiAgentDeleteFeedback = async (
        message: TicketMessage,
        payload: DeleteMessageFeedback,
    ) => {
        await deleteAIAgentTicketMessagesFeedback([message.id!, payload])
    }

    return {
        aiAgentSendFeedback: useCallback(aiAgentSendFeedback, [
            submitAIAgentTicketMessagesFeedback,
            dispatch,
        ]),
        aiAgentDeleteFeedback: useCallback(aiAgentDeleteFeedback, [
            deleteAIAgentTicketMessagesFeedback,
        ]),
    }
}
