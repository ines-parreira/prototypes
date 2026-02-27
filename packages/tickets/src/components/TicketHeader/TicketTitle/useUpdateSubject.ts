import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { HttpResponse, Ticket } from '@gorgias/helpdesk-queries'
import { queryKeys, useUpdateTicket } from '@gorgias/helpdesk-queries'

import { useTicketsLegacyBridge } from '../../../utils/LegacyBridge'
import { NotificationStatus } from '../../../utils/LegacyBridge/context'
import { patchTicketInViewListCache } from '../../../utils/optimisticUpdates/viewListCache'

export function useUpdateSubject(ticketId: number) {
    const { dispatchNotification } = useTicketsLegacyBridge()
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
                        const nextSubject = data.data.subject ?? ''

                        return {
                            ...old,
                            data: {
                                ...previousTicket,
                                subject: nextSubject,
                            },
                        }
                    },
                )
            },
        },
    })

    const updateSubject = useCallback(
        async (ticketId: number, subject: string) => {
            try {
                await mutateAsyncUpdateTicket({
                    id: ticketId,
                    data: { subject },
                })
                patchTicketInViewListCache(queryClient, ticketId, { subject })
                await queryClient.invalidateQueries({ queryKey })
            } catch {
                dispatchNotification({
                    status: NotificationStatus.Error,
                    message: 'Failed to update subject',
                })
            }
        },
        [mutateAsyncUpdateTicket, queryClient, queryKey, dispatchNotification],
    )

    return {
        updateSubject,
    }
}
