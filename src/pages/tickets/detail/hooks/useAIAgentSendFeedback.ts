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

export const useAIAgentSendFeedback = () => {
    const {mutateAsync: submitAIAgentTicketMessagesFeedback} =
        useSubmitAIAgentTicketMessagesFeedback<{
            previousFeedback: AxiosResponse<TicketFeedback, any> | undefined
            ticketId: number
        }>({
            onMutate: async (params) => {
                const [ticketId, messageId, feedback] = params
                const queryKey = aiAgentFeedbackKeys.detail(ticketId)

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

                return {previousFeedback, ticketId}
            },
            onError: (error, _, context) => {
                if (context) {
                    queryClient.setQueryData<
                        AxiosResponse<TicketFeedback, any>
                    >(
                        aiAgentFeedbackKeys.detail(context.ticketId),
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
            onSuccess: (data, _, context) => {
                if (!context) {
                    return
                }
                void queryClient.invalidateQueries({
                    queryKey: aiAgentFeedbackKeys.detail(context.ticketId),
                })
            },
        })

    const {mutateAsync: deleteAIAgentTicketMessagesFeedback} =
        useDeleteAIAgentTicketMessagesFeedback()

    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()

    const aiAgentSendFeedback = async (
        message: TicketMessage,
        payload: SubmitMessageFeedback
    ) => {
        await submitAIAgentTicketMessagesFeedback(
            [message.ticket_id!, message.id!, payload],
            {
                onError: () => {
                    void dispatch(
                        notify({
                            message:
                                'There was an error sending the feedback. Please try again.',
                            status: NotificationStatus.Error,
                        })
                    )
                },
            }
        )
    }

    const aiAgentDeleteFeedback = async (
        message: TicketMessage,
        payload: DeleteMessageFeedback
    ) => {
        await deleteAIAgentTicketMessagesFeedback(
            [message.ticket_id!, message.id!, payload],
            {
                onSuccess: () => {
                    void queryClient.invalidateQueries({
                        queryKey: aiAgentFeedbackKeys.detail(
                            message.ticket_id!
                        ),
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
            }
        )
    }

    return {
        aiAgentSendFeedback: useCallback(aiAgentSendFeedback, [
            dispatch,
            submitAIAgentTicketMessagesFeedback,
        ]),
        aiAgentDeleteFeedback: useCallback(aiAgentDeleteFeedback, [
            dispatch,
            queryClient,
            deleteAIAgentTicketMessagesFeedback,
        ]),
    }
}
