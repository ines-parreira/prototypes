import { useEffect } from 'react'

import { Panel } from '@repo/layout'
import { useCurrentUserId } from '@repo/tickets'
import { useHelpdeskV2MS4Flag } from '@repo/tickets/feature-flags'
import { TicketList } from '@repo/tickets/ticket-list'
import { fromJS } from 'immutable'
import { useParams } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useSplitTicketView from 'split-ticket-view-toggle/hooks/useSplitTicketView'
import { setViewActive } from 'state/views/actions'
import { getViewPlainJS } from 'state/views/selectors'
import { TicketListView } from 'ticket-list-view'
import { useViewId } from 'tickets/core/hooks'
import type { OnToggleUnreadFn } from 'tickets/dtp'

const panelConfig = {
    defaultSize: 300,
    minSize: 300,
    maxSize: 450,
}

type Props = {
    registerOnToggleUnread?: (toggleUnreadFn: OnToggleUnreadFn) => void
}

export default function TicketsListPanel({ registerOnToggleUnread }: Props) {
    const hasUIVisionMS4 = useHelpdeskV2MS4Flag()
    const { ticketId: urlTicketId } = useParams<{ ticketId?: string }>()
    const viewId = useViewId()
    const { currentUserId } = useCurrentUserId()
    const { setIsEnabled: setSplitTicketView } = useSplitTicketView()

    const dispatch = useAppDispatch()
    const view = useAppSelector((state) => getViewPlainJS(state, `${viewId}`))

    useEffect(() => {
        if (hasUIVisionMS4 && view) {
            dispatch(setViewActive(fromJS(view)))
        }
    }, [hasUIVisionMS4, dispatch, view])

    const ticketId = urlTicketId ? parseInt(urlTicketId, 10) : undefined
    if (hasUIVisionMS4) {
        return (
            <Panel name="ticket-list-ms4" config={panelConfig}>
                <TicketList
                    viewId={viewId}
                    activeTicketId={ticketId}
                    currentUserId={currentUserId}
                    onCollapse={() => setSplitTicketView(false)}
                />
            </Panel>
        )
    }

    return (
        <Panel name="ticket-list" config={panelConfig}>
            <TicketListView
                activeTicketId={ticketId}
                registerToggleUnread={registerOnToggleUnread}
                viewId={viewId}
            />
        </Panel>
    )
}
