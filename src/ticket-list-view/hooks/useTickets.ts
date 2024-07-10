import {useEffect, useMemo, useState} from 'react'

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import {useSplitTicketView} from 'split-ticket-view-toggle'
import useDebouncedValue from 'hooks/useDebouncedValue'
import usePrevious from 'hooks/usePrevious'
import useElementSize from 'hooks/useElementSize'
import useEffectOnce from 'hooks/useEffectOnce'
import type {OnToggleUnreadFn} from 'tickets/pages/SplitTicketPage'

import useTicketIds from '../hooks/useTicketIds'
import {TICKET_HEIGHT, TICKET_HEIGHT_NEW} from '../constants'
import {SortField, TicketPartial} from '../types'
import useScrollOffset from './useScrollOffset'
import {SortOrder} from './useSortOrder'
import useStaleTickets from './useStaleTickets'
import useTicketData from './useTicketData'
import useTicketPartials from './useTicketPartials'
import usePrevNextTicketId from './usePrevNextTicketId'

export default function useTickets(
    viewId: number,
    sortOrder: SortOrder,
    ticketId?: number,
    registerToggleUnread?: (toggleUnreadFn: OnToggleUnreadFn) => void
) {
    const hasBulkActions = useFlag(FeatureFlagKey.BulkActionsDTP, false)
    const ticketHeight = hasBulkActions ? TICKET_HEIGHT_NEW : TICKET_HEIGHT

    const {hasMore, initialLoaded, loadMore, partials, setLatest} =
        useTicketPartials(viewId, sortOrder)
    const previousPartials = usePrevious(partials)
    const previousPartialsMap = useMemo(() => {
        return previousPartials?.reduce(
            (acc, p) => ({...acc, [p.id]: p}),
            {} as Record<string, TicketPartial>
        )
    }, [previousPartials])
    const newPartials = useMemo(() => {
        if (!previousPartialsMap || !Object.keys(previousPartialsMap).length) {
            return []
        }

        return partials.filter((p) => !previousPartialsMap[p.id])
    }, [partials, previousPartialsMap])
    const {markUpdated, staleTickets} = useStaleTickets(partials)

    const [element, setElement] = useState<HTMLElement | null>(null)
    const [, height] = useElementSize(element)
    const [offset] = useScrollOffset(element)
    const debouncedHeight = useDebouncedValue(height, 75)
    const debouncedOffset = useDebouncedValue(offset, 75)

    const startIndex = useMemo(
        () => Math.floor(debouncedOffset / ticketHeight),
        [debouncedOffset, ticketHeight]
    )
    const endIndex = useMemo(
        () => Math.ceil((debouncedOffset + debouncedHeight) / ticketHeight) - 1,
        [debouncedHeight, debouncedOffset, ticketHeight]
    )
    const visiblePartials = useMemo(
        () => partials.slice(startIndex, endIndex + 1),
        [endIndex, partials, startIndex]
    )
    const visiblePartialsMap = useMemo(
        () =>
            visiblePartials.reduce(
                (acc, p) => ({...acc, [p.id]: p}),
                {} as Record<string, TicketPartial>
            ),
        [visiblePartials]
    )
    const visibleNewPartialsMap = useMemo(
        () =>
            newPartials.reduce((acc, p) => {
                if (visiblePartialsMap[p.id]) {
                    acc[p.id] = p
                }
                return acc
            }, {} as Record<string, TicketPartial>),
        [newPartials, visiblePartialsMap]
    )

    const visibleStaleTicketIds = useMemo(
        (): number[] =>
            visiblePartials
                .filter((p) => !!staleTickets[p.id])
                .map((p) => p.id),
        [staleTickets, visiblePartials]
    )

    const {data, toggleUnread} = useTicketData(
        visibleStaleTicketIds,
        markUpdated,
        ticketId
    )

    useEffectOnce(() => {
        registerToggleUnread?.(toggleUnread)
    })

    const tickets = partials.map((partial) => data[partial.id] || partial)

    const sortField = useMemo(
        () => sortOrder.split(':')[0] as SortField,
        [sortOrder]
    )

    const latestDatetime = useMemo(() => {
        const lastVisiblePartial = visiblePartials[visiblePartials.length - 1]
        if (!lastVisiblePartial || !data[lastVisiblePartial.id]) {
            return null
        }

        return data[lastVisiblePartial.id][sortField] || Infinity
    }, [data, sortField, visiblePartials])

    useEffect(() => {
        setLatest(endIndex, latestDatetime)
    }, [endIndex, latestDatetime, setLatest])

    const ticketIds = useTicketIds(tickets)

    const previousTicketId = usePrevNextTicketId(ticketId, 'prev', partials)
    const nextTicketId = usePrevNextTicketId(ticketId, 'next', partials)

    const {setPrevNextTicketIds} = useSplitTicketView()

    useEffect(() => {
        setPrevNextTicketIds({
            prev: previousTicketId,
            next: nextTicketId,
        })
    }, [previousTicketId, nextTicketId, setPrevNextTicketIds])

    return {
        hasMore,
        initialLoaded,
        loadMore,
        setElement,
        staleTickets,
        tickets,
        newTickets: visibleNewPartialsMap,
        ticketIds,
    }
}
