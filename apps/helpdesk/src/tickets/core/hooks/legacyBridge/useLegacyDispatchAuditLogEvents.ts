import { useCallback } from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { displayAuditLogEvents, hideAuditLogEvents } from 'state/ticket/actions'

/**
 * Mirroring the https://github.com/gorgias/helpdesk-web-app/blob/545de38911732e73ac4c2c4696c8f2ea0b5255a0/apps/helpdesk/src/pages/tickets/detail/components/TicketHeader.tsx#L232
 * functionality to display the ticket events.
 * Should be removed once the ticket events data-fetching and display is migrated
 * to use the @gorgias/helpdesk-queries package.
 * Planned for MS3 https://linear.app/gorgias/issue/SUPXP-4717/update-the-ticket-events-data-fetching-and-display-logic
 */
export function useLegacyDispatchAuditLogEvents() {
    const dispatch = useAppDispatch()
    const ticket = useAppSelector((state) => state.ticket)
    return useCallback(() => {
        dispatch(
            displayAuditLogEvents(
                ticket.get('id'),
                ticket.get('satisfaction_survey')?.get('id'),
            ),
        )
    }, [dispatch, ticket])
}

export function useLegacyDispatchHideAuditLogEvents() {
    const dispatch = useAppDispatch()
    return useCallback(() => {
        dispatch(hideAuditLogEvents())
    }, [dispatch])
}
