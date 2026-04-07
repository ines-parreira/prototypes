import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import type {
    MergeTicketsBody,
    MergeTicketsParams,
} from '@gorgias/helpdesk-queries'
import {
    queryKeys,
    useMergeTickets as useMergeTicketsPrimitive,
} from '@gorgias/helpdesk-queries'

import { useTicketViewNavigation } from '../../../../hooks/useTicketViewNavigation'
import { removeTicketFromViewListCache } from '../../../../utils/optimisticUpdates/viewListCache'

export function useMergeTickets(ticketId: number) {
    const { navigateToTicket } = useTicketViewNavigation()
    const queryClient = useQueryClient()
    const sourceTicketQueryKey = queryKeys.tickets.getTicket(Number(ticketId))

    const { mutateAsync: mutateAsyncMergeTickets } = useMergeTicketsPrimitive()

    const mergeTickets = useCallback(
        async (data: MergeTicketsBody, params: MergeTicketsParams) => {
            try {
                await mutateAsyncMergeTickets({ data, params })
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.tickets.getTicket(
                        Number(params.target_id),
                    ),
                })
                toast.success('Tickets merged successfully')
                navigateToTicket(Number(params.target_id))
                removeTicketFromViewListCache(queryClient, ticketId)
                await queryClient.removeQueries({
                    queryKey: sourceTicketQueryKey,
                })
            } catch {
                toast.error('Could not merge tickets')
            }
        },
        [
            queryClient,
            navigateToTicket,
            mutateAsyncMergeTickets,
            sourceTicketQueryKey,
            ticketId,
        ],
    )

    return {
        mergeTickets,
    }
}
