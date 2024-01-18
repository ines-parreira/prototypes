import {useEffect, useMemo, useState} from 'react'

import useDebouncedValue from 'hooks/useDebouncedValue'
import usePrevious from 'hooks/usePrevious'

import useTicketIds from '../hooks/useTicketIds'
import {TICKET_HEIGHT} from '../constants'
import {TicketPartial} from '../types'
import useElementSize from './useElementSize'
import useScrollOffset from './useScrollOffset'
import {SortOrder} from './useSortOrder'
import useStaleTickets from './useStaleTickets'
import useTicketData from './useTicketData'
import useTicketPartials from './useTicketPartials'

export default function useTickets(
    viewId: number,
    sortOrder: SortOrder,
    ticketId?: number
) {
    const {hasMore, loading, loadMore, partials, setLatest} = useTicketPartials(
        viewId,
        sortOrder
    )
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
        () => Math.floor(debouncedOffset / TICKET_HEIGHT),
        [debouncedOffset]
    )
    const endIndex = useMemo(
        () => Math.ceil((debouncedOffset + debouncedHeight) / TICKET_HEIGHT),
        [debouncedHeight, debouncedOffset]
    )
    const visiblePartials = useMemo(
        () => partials.slice(startIndex, endIndex),
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

    const data = useTicketData(visibleStaleTicketIds, markUpdated, ticketId)
    const tickets = partials.map((partial) => data[partial.id] || partial)

    const latestTimestamp = useMemo(() => {
        const lastVisiblePartial = visiblePartials[visiblePartials.length - 1]
        if (!lastVisiblePartial) return 0

        const lastId = lastVisiblePartial.id
        return data[lastId]?.created_datetime
            ? new Date(data[lastId].created_datetime).getTime()
            : 0
    }, [data, visiblePartials])

    useEffect(() => {
        setLatest(endIndex, latestTimestamp)
    }, [endIndex, latestTimestamp, setLatest])

    const ticketIds = useTicketIds(tickets)

    return {
        hasMore,
        loading,
        loadMore,
        setElement,
        staleTickets,
        tickets,
        newTickets: visibleNewPartialsMap,
        ticketIds,
    }
}
