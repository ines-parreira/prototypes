import {useCallback} from 'react'
import {useQueryClient} from '@tanstack/react-query'
import {
    DeleteMessageFeedback,
    SubmitMessageFeedback,
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
        useSubmitAIAgentTicketMessagesFeedback()

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
                                'There was an error sending the feedback. Please try again.',
                            status: NotificationStatus.Error,
                        })
                    )
                },
            }
        )
    }

    const aiAgendDeleteFeedback = async (
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
            queryClient,
            submitAIAgentTicketMessagesFeedback,
        ]),
        aiAgentDeleteFeedback: useCallback(aiAgendDeleteFeedback, [
            dispatch,
            queryClient,
            deleteAIAgentTicketMessagesFeedback,
        ]),
    }
}
