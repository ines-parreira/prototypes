import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { HttpResponse, Ticket } from '@gorgias/helpdesk-queries'
import { queryKeys, useUpdateTicket } from '@gorgias/helpdesk-queries'

import { useTicketViewNavigation } from '../../../../hooks/useTicketViewNavigation'
import { useTicketsLegacyBridge } from '../../../../utils/LegacyBridge'
import { NotificationStatus } from '../../../../utils/LegacyBridge/context'
import {
    patchTicketInViewListCache,
    removeTicketFromViewListCache,
} from '../../../../utils/optimisticUpdates/viewListCache'

export function useTrashTicket(ticketId: number) {
    const { dispatchNotification, dispatchDismissNotification } =
        useTicketsLegacyBridge()
    const { handleGoToNextViewTicket, navigateToTicket } =
        useTicketViewNavigation()
    const queryClient = useQueryClient()
    const queryKey = queryKeys.tickets.getTicket(Number(ticketId))

    const { mutateAsync: mutateAsyncUpdateTicket } = useUpdateTicket({
        mutation: {
            onMutate: async (data) => {
                await queryClient.cancelQueries({ queryKey })
                queryClient.setQueryData<HttpResponse<Ticket> | undefined>(
                    queryKey,
                    (old) => {
                        if (!old) return old
                        const previousTicket = old.data
                        const nextTrashed = data.data.trashed_datetime ?? null
                        return {
                            ...old,
                            data: {
                                ...previousTicket,
                                trashed_datetime: nextTrashed,
                            },
                        }
                    },
                )
            },
        },
    })

    const trashTicket = useCallback(
        async (ticketId: number, data: { trashed_datetime: string | null }) => {
            try {
                await mutateAsyncUpdateTicket({
                    id: ticketId,
                    data,
                })
                if (data.trashed_datetime) {
                    removeTicketFromViewListCache(queryClient, ticketId)
                } else {
                    patchTicketInViewListCache(queryClient, ticketId, {
                        trashed_datetime: null,
                    })
                }
                await queryClient.invalidateQueries({
                    queryKey,
                })

                // Un deleting a ticket doesn't show a notification
                if (!data.trashed_datetime) {
                    return
                }

                const trashNotificationId = `trash-${ticketId}`
                dispatchNotification({
                    id: trashNotificationId,
                    dismissAfter: 5000,
                    status: NotificationStatus.Success,
                    message: 'Ticket has been moved to trash',
                    buttons: [
                        {
                            name: 'Undo',
                            primary: true,
                            onClick: () => {
                                dispatchDismissNotification(trashNotificationId)
                                navigateToTicket(ticketId)
                                trashTicket(ticketId, {
                                    trashed_datetime: null,
                                })
                            },
                        },
                    ],
                })
                handleGoToNextViewTicket()
            } catch {
                dispatchNotification({
                    status: NotificationStatus.Error,
                    message: 'Failed to move to trash',
                })
            }
        },
        [
            mutateAsyncUpdateTicket,
            queryClient,
            queryKey,
            dispatchNotification,
            dispatchDismissNotification,
            handleGoToNextViewTicket,
            navigateToTicket,
        ],
    )

    return {
        trashTicket,
    }
}
