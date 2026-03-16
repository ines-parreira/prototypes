import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { HttpResponse, Ticket } from '@gorgias/helpdesk-queries'
import { queryKeys, useUpdateTicket } from '@gorgias/helpdesk-queries'

import { useTicketsLegacyBridge } from '../../utils/LegacyBridge'
import { NotificationStatus } from '../../utils/LegacyBridge/context'
import { patchTicketInViewListCache } from '../../utils/optimisticUpdates/viewListCache'
import { TicketStatus } from './utils'

export function useOpenTicket(ticketId: number) {
    const { dispatchNotification } = useTicketsLegacyBridge()
    const queryClient = useQueryClient()
    const queryKey = queryKeys.tickets.getTicket(Number(ticketId))

    const { mutateAsync: mutateAsyncUpdateTicket } = useUpdateTicket({
        mutation: {
            onMutate: async () => {
                await queryClient.cancelQueries({ queryKey })
                queryClient.setQueryData<HttpResponse<Ticket> | undefined>(
                    queryKey,
                    (old) => {
                        if (!old) return old
                        const previousTicket = old.data
                        return {
                            ...old,
                            data: {
                                ...previousTicket,
                                status: TicketStatus.Open,
                                snooze_datetime: null,
                            },
                        }
                    },
                )
            },
        },
    })

    const openTicket = useCallback(async () => {
        try {
            const data = {
                status: TicketStatus.Open,
                snooze_datetime: null,
            }
            await mutateAsyncUpdateTicket({
                id: ticketId,
                data,
            })
            patchTicketInViewListCache(queryClient, ticketId, data)
            await queryClient.invalidateQueries({
                queryKey,
            })
        } catch {
            dispatchNotification({
                status: NotificationStatus.Error,
                message: 'Failed to open ticket',
            })
        }
    }, [
        mutateAsyncUpdateTicket,
        queryClient,
        queryKey,
        dispatchNotification,
        ticketId,
    ])

    return {
        openTicket,
    }
}
