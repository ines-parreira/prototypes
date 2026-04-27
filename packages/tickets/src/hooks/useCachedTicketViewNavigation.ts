import { useMemo } from 'react'

import type { InfiniteData } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '@gorgias/helpdesk-queries'

import { useSortOrder } from '../ticket-list/hooks/useSortOrder'
import type { UseTicketsListParams } from '../ticket-list/hooks/useTicketsList'
import type { useTicketsLegacyBridge } from '../utils/LegacyBridge'

type TicketViewNavigation = ReturnType<
    typeof useTicketsLegacyBridge
>['ticketViewNavigation']

type CachedTicketsList = InfiniteData<{ data?: Array<{ id?: number }> }>

const disabledQueryKey = ['cachedTicketViewNavigation', 'disabled'] as const

function* getCachedTicketIds(cachedList: CachedTicketsList) {
    for (const page of cachedList.pages) {
        for (const ticket of page.data ?? []) {
            if (typeof ticket.id === 'number') {
                yield ticket.id
            }
        }
    }
}

function getAdjacentTicketIds(cachedList: CachedTicketsList, ticketId: number) {
    let previousTicketId: number | undefined
    let hasFoundTicket = false

    for (const currentTicketId of getCachedTicketIds(cachedList)) {
        if (hasFoundTicket) {
            return {
                previousTicketId,
                nextTicketId: currentTicketId,
            }
        }

        if (currentTicketId === ticketId) {
            hasFoundTicket = true
            continue
        }

        previousTicketId = currentTicketId
    }

    return hasFoundTicket
        ? {
              previousTicketId,
              nextTicketId: undefined,
          }
        : undefined
}

function getCachedTicketViewNavigation({
    cachedList,
    ticketId,
}: {
    cachedList?: CachedTicketsList
    ticketId?: number
}): TicketViewNavigation | undefined {
    if (!cachedList || ticketId == null) {
        return undefined
    }

    const adjacentTicketIds = getAdjacentTicketIds(cachedList, ticketId)
    if (!adjacentTicketIds) {
        return undefined
    }

    const { previousTicketId, nextTicketId } = adjacentTicketIds
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
    const [sortOrder] = useSortOrder(viewId ?? 0, {
        isDraftView: viewId == null,
    })

    const params =
        viewId != null
            ? ({ order_by: sortOrder } satisfies UseTicketsListParams)
            : undefined

    const queryKey =
        viewId != null ? queryKeys.views.listViewItems(viewId, params) : null

    const { data: cachedList } = useQuery<CachedTicketsList | undefined>({
        queryKey: queryKey ?? disabledQueryKey,
        queryFn: () => Promise.resolve(undefined),
        enabled: false,
        notifyOnChangeProps: ['data'],
    })

    return useMemo(
        () =>
            getCachedTicketViewNavigation({
                cachedList: viewId == null ? undefined : cachedList,
                ticketId,
            }),
        [cachedList, ticketId, viewId],
    )
}
