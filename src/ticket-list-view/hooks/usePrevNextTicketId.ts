import {useMemo} from 'react'

import {TicketPartial} from 'ticket-list-view/types'

export default function usePrevNextTicketId(
    activeTicketId: number | undefined,
    direction: 'prev' | 'next',
    partials: TicketPartial[]
) {
    return useMemo(() => {
        if (!activeTicketId) return

        const index = partials.findIndex((p) => p.id === activeTicketId)
        if (index === -1) return

        return direction === 'prev'
            ? partials[index - 1]?.id
            : partials[index + 1]?.id
    }, [activeTicketId, direction, partials])
}
