import { useCallback, useEffect, useRef } from 'react'

import { DurationInMs } from '@repo/utils'
import _debounce from 'lodash/debounce'

import type { TicketCompact } from '@gorgias/helpdesk-types'
import { useAgentActivity } from '@gorgias/realtime-ably'

const DEBOUNCED_VIEW_TICKETS_DELAY = DurationInMs.OneSecond

export function useViewVisibleTickets() {
    const { viewTickets: viewTicketsRaw } = useAgentActivity()
    const debouncedViewTicketsRef = useRef<ReturnType<typeof _debounce>>()

    useEffect(() => {
        debouncedViewTicketsRef.current = _debounce(
            viewTicketsRaw,
            DEBOUNCED_VIEW_TICKETS_DELAY,
            { leading: true },
        )

        return () => {
            debouncedViewTicketsRef.current?.cancel()
        }
    }, [viewTicketsRaw])

    const viewVisibleTickets = useCallback(
        (visibleTickets: TicketCompact[]) => {
            const ticketIds = visibleTickets.map((t) => t.id)
            if (ticketIds.length > 0) {
                debouncedViewTicketsRef.current?.(ticketIds)
            }
        },
        [],
    )

    return { viewVisibleTickets }
}
