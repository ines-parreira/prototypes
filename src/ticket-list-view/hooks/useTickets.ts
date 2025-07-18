import { useEffect, useMemo, useRef, useState } from 'react'

import { SearchTicketsOrderBy } from '@gorgias/helpdesk-types'

import useDebouncedValue from 'hooks/useDebouncedValue'
import useElementSize from 'hooks/useElementSize'
import usePrevious from 'hooks/usePrevious'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import useViewTickets from 'ticket-list-view/hooks/useViewTickets'
import type { OnToggleUnreadFn } from 'tickets/dtp'

import { TICKET_HEIGHT } from '../constants'
import useTicketIds from '../hooks/useTicketIds'
import { SortField, TicketPartial } from '../types'
import usePrevNextTicketId from './usePrevNextTicketId'
import useScrollOffset from './useScrollOffset'
import useStaleTickets from './useStaleTickets'
import useTicketData from './useTicketData'
import useTicketPartials from './useTicketPartials'

export default function useTickets(
    viewId: number,
    sortOrder: SearchTicketsOrderBy,
    ticketId?: number,
    registerToggleUnread?: (toggleUnreadFn: OnToggleUnreadFn) => void,
) {
    const toggleUnreadRegisteredRef = useRef(false)
    const {
        hasMore,
        initialLoaded,
        loadMore,
        partials,
        pauseUpdates,
        resumeUpdates,
        setLatest,
    } = useTicketPartials(viewId, sortOrder)
    const previousPartials = usePrevious(partials)
    const previousPartialsMap = useMemo(() => {
        return previousPartials?.reduce(
            (acc, p) => ({ ...acc, [p.id]: p }),
            {} as Record<string, TicketPartial>,
        )
    }, [previousPartials])
    const newPartials = useMemo(() => {
        if (!previousPartialsMap || !Object.keys(previousPartialsMap).length) {
            return []
        }

        return partials.filter((p) => !previousPartialsMap[p.id])
    }, [partials, previousPartialsMap])
    const { markUpdated, staleTickets } = useStaleTickets(partials)

    const [element, setElement] = useState<HTMLElement | null>(null)
    const [, height] = useElementSize(element)
    const [offset] = useScrollOffset(element)
    const debouncedHeight = useDebouncedValue(height, 75)
    const debouncedOffset = useDebouncedValue(offset, 75)

    const startIndex = useMemo(
        () => Math.floor(debouncedOffset / TICKET_HEIGHT),
        [debouncedOffset],
    )
    const endIndex = useMemo(
        () =>
            Math.ceil((debouncedOffset + debouncedHeight) / TICKET_HEIGHT) - 1,
        [debouncedHeight, debouncedOffset],
    )
    const visiblePartials = useMemo(
        () => partials.slice(startIndex, endIndex + 1),
        [endIndex, partials, startIndex],
    )
    const visiblePartialsMap = useMemo(
        () =>
            visiblePartials.reduce(
                (acc, p) => ({ ...acc, [p.id]: p }),
                {} as Record<string, TicketPartial>,
            ),
        [visiblePartials],
    )
    const visibleNewPartialsMap = useMemo(
        () =>
            newPartials.reduce(
                (acc, p) => {
                    if (visiblePartialsMap[p.id]) {
                        acc[p.id] = p
                    }
                    return acc
                },
                {} as Record<string, TicketPartial>,
            ),
        [newPartials, visiblePartialsMap],
    )

    useViewTickets(visiblePartials, true)

    const visibleStaleTicketIds = useMemo(
        (): number[] =>
            visiblePartials
                .filter((p) => !!staleTickets[p.id])
                .map((p) => p.id),
        [staleTickets, visiblePartials],
    )

    const { bulkToggleUnread, data, toggleUnread } = useTicketData(
        visibleStaleTicketIds,
        markUpdated,
        ticketId,
    )

    useEffect(() => {
        if (!registerToggleUnread || toggleUnreadRegisteredRef.current) return

        registerToggleUnread(toggleUnread)
        toggleUnreadRegisteredRef.current = true
    }, [registerToggleUnread, toggleUnread])

    const tickets = partials.map((partial) => data[partial.id] || partial)

    const sortField = useMemo(
        () => sortOrder.split(':')[0] as SortField,
        [sortOrder],
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

    const { setPrevNextTicketIds } = useSplitTicketView()

    useEffect(() => {
        setPrevNextTicketIds({
            prev: previousTicketId,
            next: nextTicketId,
        })
    }, [previousTicketId, nextTicketId, setPrevNextTicketIds])

    return useMemo(
        () => ({
            bulkToggleUnread,
            hasMore,
            initialLoaded,
            loadMore,
            pauseUpdates,
            resumeUpdates,
            setElement,
            staleTickets,
            tickets,
            ticketIds,
            newTickets: visibleNewPartialsMap,
        }),
        [
            bulkToggleUnread,
            hasMore,
            initialLoaded,
            loadMore,
            pauseUpdates,
            resumeUpdates,
            setElement,
            staleTickets,
            tickets,
            ticketIds,
            visibleNewPartialsMap,
        ],
    )
}
