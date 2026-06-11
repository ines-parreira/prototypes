import { useCallback, useEffect, useRef } from 'react'

import { history } from '@repo/routing'
import { useTicketViewNavigation } from '@repo/tickets'
import { useParams } from 'react-router-dom'

import { useViewId } from 'tickets/core/hooks'

type Args = {
    isOnSplitTicketView?: boolean
}

export function useSplitTicketCloseNavigation({ isOnSplitTicketView }: Args) {
    const { ticketId } = useParams<{ ticketId: string }>()
    const viewId = useViewId()
    const { ticketViewNavigation } = useTicketViewNavigation()
    const navigationContextRef = useRef({
        ticketId,
        viewId,
    })
    const lastKnownNextTicketIdRef = useRef<number | undefined>(undefined)
    const shouldUseSplitTicketNavigation = Boolean(
        isOnSplitTicketView && viewId,
    )

    useEffect(() => {
        const didNavigationContextChange =
            navigationContextRef.current.ticketId !== ticketId ||
            navigationContextRef.current.viewId !== viewId

        if (didNavigationContextChange) {
            lastKnownNextTicketIdRef.current = undefined
            navigationContextRef.current = {
                ticketId,
                viewId,
            }
        }

        if (ticketViewNavigation.nextTicketId != null) {
            lastKnownNextTicketIdRef.current = ticketViewNavigation.nextTicketId
        }
    }, [ticketId, ticketViewNavigation.nextTicketId, viewId])

    const handleGoToNextTicket = useCallback(() => {
        const nextTicketId =
            ticketViewNavigation.nextTicketId ??
            lastKnownNextTicketIdRef.current
        history.push(
            nextTicketId
                ? `/app/views/${viewId}/${nextTicketId}`
                : `/app/views/${viewId}`,
        )
    }, [ticketViewNavigation.nextTicketId, viewId])

    return shouldUseSplitTicketNavigation ? handleGoToNextTicket : undefined
}
