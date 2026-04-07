import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import type { HttpResponse, Ticket } from '@gorgias/helpdesk-queries'
import { queryKeys, useUpdateTicket } from '@gorgias/helpdesk-queries'

import { useTicketViewNavigation } from '../../hooks/useTicketViewNavigation'
import { patchTicketInViewListCache } from '../../utils/optimisticUpdates/viewListCache'
import { TicketStatus } from './utils'

export function useSnoozeTicket(ticketId: number) {
    const { handleGoToNextViewTicket } = useTicketViewNavigation()
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
                        const nextSnooze = data.data.snooze_datetime ?? null
                        return {
                            ...old,
                            data: {
                                ...previousTicket,
                                snooze_datetime: nextSnooze,
                                status: TicketStatus.Closed,
                            },
                        }
                    },
                )
            },
        },
    })

    const snoozeTicket = useCallback(
        async (data: { snooze_datetime: string | null; status: 'closed' }) => {
            try {
                await mutateAsyncUpdateTicket({
                    id: ticketId,
                    data,
                })
                patchTicketInViewListCache(queryClient, ticketId, data)
                await queryClient.invalidateQueries({
                    queryKey,
                })

                if (data.snooze_datetime) {
                    toast.success('Ticket has been snoozed')
                    handleGoToNextViewTicket()
                }
            } catch {
                toast.error('Failed to snooze ticket')
            }
        },
        [
            ticketId,
            mutateAsyncUpdateTicket,
            queryClient,
            queryKey,
            handleGoToNextViewTicket,
        ],
    )

    return {
        snoozeTicket,
    }
}
