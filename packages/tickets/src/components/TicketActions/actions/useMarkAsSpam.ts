import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { HttpResponse, Ticket } from '@gorgias/helpdesk-queries'
import { queryKeys, useUpdateTicket } from '@gorgias/helpdesk-queries'

import { useTicketViewNavigation } from '../../../hooks/useTicketViewNavigation'
import { useTicketsLegacyBridge } from '../../../utils/LegacyBridge'
import { NotificationStatus } from '../../../utils/LegacyBridge/context'
import {
    patchTicketInViewListCache,
    removeTicketFromViewListCache,
} from '../../../utils/optimisticUpdates/viewListCache'

export function useMarkAsSpam(ticketId: number) {
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
                        const nextSpam = data.data.spam ?? false
                        return {
                            ...old,
                            data: {
                                ...previousTicket,
                                spam: nextSpam,
                            },
                        }
                    },
                )
            },
        },
    })

    const markAsSpam = useCallback(
        async (ticketId: number, data: { spam: boolean }) => {
            try {
                await mutateAsyncUpdateTicket({
                    id: ticketId,
                    data,
                })
                if (data.spam) {
                    removeTicketFromViewListCache(queryClient, ticketId)
                } else {
                    patchTicketInViewListCache(queryClient, ticketId, {
                        spam: false,
                    })
                }
                await queryClient.invalidateQueries({
                    queryKey,
                })

                // Unmarking a ticket as spam doesn't show a notification
                if (!data.spam) {
                    return
                }

                const spamNotificationId = `spam-${ticketId}`
                dispatchNotification({
                    id: spamNotificationId,
                    dismissAfter: 5000,
                    status: NotificationStatus.Success,
                    message: 'Ticket has been marked as spam',
                    buttons: [
                        {
                            name: 'Undo',
                            primary: true,
                            onClick: () => {
                                dispatchDismissNotification(spamNotificationId)
                                navigateToTicket(ticketId)
                                markAsSpam(ticketId, { spam: false })
                            },
                        },
                    ],
                })
                handleGoToNextViewTicket()
            } catch {
                dispatchNotification({
                    status: NotificationStatus.Error,
                    message: 'Failed to mark as spam',
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
        markAsSpam,
    }
}
