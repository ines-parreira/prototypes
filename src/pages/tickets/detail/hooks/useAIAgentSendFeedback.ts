import {useCallback} from 'react'
import {useQueryClient} from '@tanstack/react-query'
import {AxiosResponse} from 'axios'
import {
    DeleteMessageFeedback,
    SubmitMessageFeedback,
    TicketFeedback,
} from 'models/aiAgentFeedback/types'
import {
    aiAgentFeedbackKeys,
    useSubmitAIAgentTicketMessagesFeedback,
    useDeleteAIAgentTicketMessagesFeedback,
} from 'models/aiAgentFeedback/queries'
import {TicketMessage} from 'models/ticket/types'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import useAppSelector from 'hooks/useAppSelector'
import {getAIAgentMessages} from 'state/ticket/selectors'

export const useAIAgentSendFeedback = () => {
    const aiMessages = useAppSelector(getAIAgentMessages)
    const messageIds = aiMessages.map((message) => message.id) as number[]
    const queryKey = aiAgentFeedbackKeys.detail(messageIds)

    const {mutateAsync: submitAIAgentTicketMessagesFeedback} =
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
                            messages: [
                                ...previousFeedback.data.messages.map(
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
                                    }
                                ),
                            ],
                        },
                    })
                }

                return {previousFeedback}
            },
            onError: (error, _, context) => {
                if (context) {
                    queryClient.setQueryData<
                        AxiosResponse<TicketFeedback, any>
                    >(
                        aiAgentFeedbackKeys.detail(messageIds),
                        context.previousFeedback
                    )
                }

                void dispatch(
                    notify({
                        message:
                            'There was an error sending the feedback. Please try again.',
                        status: NotificationStatus.Error,
                    })
                )
            },
            onSuccess: () => {
                void queryClient.invalidateQueries({
                    queryKey: aiAgentFeedbackKeys.detail(messageIds),
                })
            },
        })

    const {mutateAsync: deleteAIAgentTicketMessagesFeedback} =
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
                    })
                )
            },
        })

    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()

    const aiAgentSendFeedback = async (
        message: TicketMessage,
        payload: SubmitMessageFeedback
    ) => {
        await submitAIAgentTicketMessagesFeedback([message.id!, payload])
    }

    const aiAgentDeleteFeedback = async (
        message: TicketMessage,
        payload: DeleteMessageFeedback
    ) => {
        await deleteAIAgentTicketMessagesFeedback([message.id!, payload])
    }

    return {
        aiAgentSendFeedback: useCallback(aiAgentSendFeedback, [
            submitAIAgentTicketMessagesFeedback,
        ]),
        aiAgentDeleteFeedback: useCallback(aiAgentDeleteFeedback, [
            deleteAIAgentTicketMessagesFeedback,
        ]),
    }
}
