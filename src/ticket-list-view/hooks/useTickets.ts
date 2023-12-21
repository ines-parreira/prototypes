import {useEffect, useMemo, useState} from 'react'

import useDebouncedValue from 'hooks/useDebouncedValue'

import {TICKET_HEIGHT} from '../constants'
import useElementSize from './useElementSize'
import useScrollOffset from './useScrollOffset'
import useStaleTickets from './useStaleTickets'
import useTicketPartials from './useTicketPartials'

export default function useTickets(viewId: number) {
    const {hasMore, loading, loadMore, partials} = useTicketPartials(viewId)
    const {staleTickets} = useStaleTickets(partials)

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

    useEffect(() => {
        // eslint-disable-next-line no-console
        console.log('visibleStaleTicketIds', visibleStaleTicketIds)
    }, [visibleStaleTicketIds])

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
