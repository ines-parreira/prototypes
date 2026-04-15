import { useMemo, useSyncExternalStore } from 'react'

import type { InfiniteData } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@gorgias/helpdesk-queries'

import { useSortOrder } from '../ticket-list/hooks/useSortOrder'
import type { UseTicketsListParams } from '../ticket-list/hooks/useTicketsList'
import type { useTicketsLegacyBridge } from '../utils/LegacyBridge'

type TicketViewNavigation = ReturnType<
    typeof useTicketsLegacyBridge
>['ticketViewNavigation']

function getCachedTicketViewNavigation({
    cachedList,
    ticketId,
}: {
    cachedList?: InfiniteData<{ data?: Array<{ id?: number }> }>
    ticketId?: number
}): TicketViewNavigation | undefined {
    if (!cachedList || ticketId == null) {
        return undefined
    }

    const navigableTickets = cachedList.pages.flatMap((page) =>
        (page.data ?? []).filter(
            (ticket): ticket is { id: number } => typeof ticket.id === 'number',
        ),
    )

    const ticketIndex = navigableTickets.findIndex(
        (ticket) => ticket.id === ticketId,
    )

    if (ticketIndex === -1) {
        return undefined
    }

    const previousTicketId = navigableTickets[ticketIndex - 1]?.id
    const nextTicketId = navigableTickets[ticketIndex + 1]?.id
    const isPreviousEnabled = previousTicketId !== undefined
    const isNextEnabled = nextTicketId !== undefined

    return {
        isSearchView: false,
        shouldDisplay: isPreviousEnabled || isNextEnabled,
        shouldUseLegacyFunctions: false,
        previousTicketId,
        nextTicketId,
        legacyGoToPrevTicket: async () => undefined,
        isPreviousEnabled,
        legacyGoToNextTicket: async () => undefined,
        isNextEnabled,
    }
}

export function useCachedTicketViewNavigation({
    viewId,
    ticketId,
}: {
    viewId?: number
    ticketId?: number
}) {
    const queryClient = useQueryClient()
    const [sortOrder] = useSortOrder(viewId ?? 0, {
        isDraftView: viewId == null,
    })

    const params =
        viewId != null
            ? ({ order_by: sortOrder } satisfies UseTicketsListParams)
            : undefined

    const queryKey =
        viewId != null ? queryKeys.views.listViewItems(viewId, params) : null

    const cachedList = useSyncExternalStore(
        (onStoreChange) => queryClient.getQueryCache().subscribe(onStoreChange),
        () =>
            queryKey == null
                ? undefined
                : queryClient.getQueryData<
                      InfiniteData<{ data?: Array<{ id?: number }> }>
                  >(queryKey),
        () => undefined,
    )

    return useMemo(
        () =>
            getCachedTicketViewNavigation({
                cachedList,
                ticketId,
            }),
        [cachedList, ticketId],
    )
}
