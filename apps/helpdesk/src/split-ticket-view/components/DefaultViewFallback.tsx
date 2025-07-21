import React, { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { ViewType } from 'models/view/types'
import { getViewIdToDisplay } from 'state/views/selectors'
import { TicketListView } from 'ticket-list-view'
import type { OnToggleUnreadFn } from 'tickets/dtp'

type Params = {
    ticketId?: string
    viewId?: string
    registerToggleUnread?: (toggleUnreadFn: OnToggleUnreadFn) => void
}

// This component shouldn't need to exist, but there is an issue in react-router
// if you don't use the `<Route render` prop, the router will, for some reason that
// is currently unknown to us, re-mount components, causing things like scroll
// positions to be reset.
//
// On the flip-side, it is not possible to use hooks in the components passed to
// the render prop, so we've had to resort to this intermediary component in the
// meantime which does the fallback to the default view id.
export default function DefaultViewFallback({
    ticketId: urlTicketId,
    viewId: urlViewId,
    registerToggleUnread,
}: Params) {
    const defaultViewId = useAppSelector((state) =>
        getViewIdToDisplay(state)(ViewType.TicketList),
    )

    const viewId = useMemo(
        () => (urlViewId ? parseInt(urlViewId, 10) : defaultViewId!),
        [defaultViewId, urlViewId],
    )

    const ticketId = useMemo(
        () => (urlTicketId ? parseInt(urlTicketId, 10) : undefined),
        [urlTicketId],
    )

    return (
        <TicketListView
            activeTicketId={ticketId}
            viewId={viewId}
            registerToggleUnread={registerToggleUnread}
        />
    )
}
