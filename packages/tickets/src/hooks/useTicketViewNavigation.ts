import { useCallback } from 'react'

import { useHistory, useParams } from 'react-router-dom'

import { useTicketsLegacyBridge } from '../utils/LegacyBridge'
import { useCachedTicketViewNavigation } from './useCachedTicketViewNavigation'

export const useTicketViewNavigation = () => {
    const { ticketViewNavigation: legacyTicketViewNavigation } =
        useTicketsLegacyBridge()
    const history = useHistory()
    const { viewId, ticketId } = useParams<{
        viewId?: string
        ticketId?: string
    }>()
    const parsedViewId = viewId ? parseInt(viewId, 10) : undefined
    const parsedTicketId = ticketId ? parseInt(ticketId, 10) : undefined
    const cachedTicketViewNavigation = useCachedTicketViewNavigation({
        viewId: parsedViewId,
        ticketId: parsedTicketId,
    })

    const ticketViewNavigation =
        cachedTicketViewNavigation ?? legacyTicketViewNavigation

    const handleGoToPreviousViewTicket = useCallback(() => {
        if (ticketViewNavigation.shouldUseLegacyFunctions) {
            return ticketViewNavigation.legacyGoToPrevTicket()
        }
        if (viewId && ticketViewNavigation.previousTicketId) {
            history.push(
                `/app/views/${viewId}/${ticketViewNavigation.previousTicketId}`,
            )
        }
    }, [viewId, ticketViewNavigation, history])

    const handleGoToNextViewTicket = useCallback(() => {
        if (ticketViewNavigation.shouldUseLegacyFunctions) {
            return ticketViewNavigation.legacyGoToNextTicket()
        }
        if (viewId && ticketViewNavigation.nextTicketId) {
            history.push(
                `/app/views/${viewId}/${ticketViewNavigation.nextTicketId}`,
            )
        }
    }, [viewId, ticketViewNavigation, history])

    const navigateToTicket = useCallback(
        (ticketId: number) => {
            if (viewId) {
                history.push(`/app/views/${viewId}/${ticketId}`)
            } else {
                history.push(`/app/ticket/${ticketId}`)
            }
        },
        [viewId, history],
    )

    return {
        ticketViewNavigation,
        handleGoToPreviousViewTicket,
        handleGoToNextViewTicket,
        navigateToTicket,
    }
}
