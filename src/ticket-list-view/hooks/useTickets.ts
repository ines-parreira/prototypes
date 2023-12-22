import {useMemo, useState} from 'react'

import useDebouncedValue from 'hooks/useDebouncedValue'

import {TICKET_HEIGHT} from '../constants'
import useElementSize from './useElementSize'
import useScrollOffset from './useScrollOffset'
import useStaleTickets from './useStaleTickets'
import useTicketData from './useTicketData'
import useTicketPartials from './useTicketPartials'

export default function useTickets(viewId: number) {
    const {hasMore, loading, loadMore, partials} = useTicketPartials(viewId)
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
    const visibleStaleTicketIds = useMemo(
        (): number[] =>
            visiblePartials
                .filter((p) => !!staleTickets[p.id])
                .map((p) => p.id),
        [staleTickets, visiblePartials]
    )

    useTicketData(visibleStaleTicketIds, markUpdated)

    const tickets = partials

    return {
        hasMore,
        loading,
        loadMore,
        setElement,
        staleTickets,
        tickets,
    }
}
