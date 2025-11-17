import { useCallback, useMemo } from 'react'

import { useRouteMatch } from 'react-router'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useGoToNextTicket from 'pages/tickets/detail/components/TicketNavigation/hooks/useGoToNextTicket'
import useGoToPreviousTicket from 'pages/tickets/detail/components/TicketNavigation/hooks/useGoToPreviousTicket'
import useIsTicketNavigationAvailable from 'pages/tickets/detail/components/TicketNavigation/hooks/useIsTicketNavigationAvailable'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { notify } from 'state/notifications/actions'
import type { NotificationStatus } from 'state/notifications/types'
import { getActiveView } from 'state/views/selectors'

/**
 * Ticket view navigator legacy functions that will need to migrated away from
 * once we've refactored the ticket routing so that:
 * 1. Every ticket is opened in a URL containing both the view ID and the ticket ID
 * 2. Every view is opened in a URL containing the view ID
 */
function useLegacyTicketViewNavigation() {
    const {
        isEnabled: isSplitTicketViewEnabled,
        nextTicketId,
        previousTicketId,
    } = useSplitTicketView()
    /**
     * Since the provider that this hooks return value are passed on is sitting
     * above the routes that use it, we need to use the useRouteMatch hook to
     * get the ticket ID from the URL instead of useParams for example.
     */
    const matchFull = useRouteMatch<{ viewId: string; ticketId: string }>(
        '/app/views/:viewId/:ticketId?',
    )
    const matchPartial = useRouteMatch<{ ticketId: string }>(
        '/app/ticket/:ticketId',
    )

    const activeView = useAppSelector(getActiveView)
    const isSearchView = useMemo(
        () => activeView.get('search') != null,
        [activeView],
    )

    const ticketId = isSplitTicketViewEnabled
        ? matchFull?.params.ticketId
        : matchPartial?.params.ticketId

    const isNavigationAvailable = useIsTicketNavigationAvailable(ticketId)
    const { goToTicket: goToPrevTicket, isEnabled: isPreviousEnabled } =
        useGoToPreviousTicket(ticketId)
    const { goToTicket: goToNextTicket, isEnabled: isNextEnabled } =
        useGoToNextTicket(ticketId)

    const shouldDisplay =
        isSplitTicketViewEnabled && !isSearchView
            ? isPreviousEnabled || isNextEnabled
            : isNavigationAvailable

    const shouldUseLegacyFunctions = !(
        isSplitTicketViewEnabled && !isSearchView
    )
    return {
        shouldDisplay,
        shouldUseLegacyFunctions,
        previousTicketId,
        nextTicketId,
        legacyGoToPrevTicket: goToPrevTicket,
        isPreviousEnabled,
        legacyGoToNextTicket: goToNextTicket,
        isNextEnabled,
    }
}

export const useTicketLegacyBridgeFunctions = () => {
    const dispatch = useAppDispatch()
    /**
     * Will need to be removed once the notification (toast) system is migrated to the Axiom
     * design system
     */
    const dispatchNotification = useCallback(
        (config: { status: NotificationStatus; message: string }) =>
            dispatch(notify(config)),
        [dispatch],
    )

    const ticketViewNavigation = useLegacyTicketViewNavigation()

    return useMemo(
        () => ({
            dispatchNotification,
            ticketViewNavigation,
        }),
        [dispatchNotification, ticketViewNavigation],
    )
}
