import React, {useMemo} from 'react'
import {RouteComponentProps} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {ViewType} from 'models/view/types'
import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import {Config, Panel, Panels} from 'panels'
import {getViewIdToDisplay} from 'state/views/selectors'
import {TicketListView} from 'ticket-list-view'
import {EmptyTicket} from 'ticket-page'

type Params = {
    viewId?: string
}

export default function ViewLayout({
    match: {
        params: {viewId: urlViewId},
    },
}: RouteComponentProps<Params>) {
    const defaultViewId = useAppSelector((state) =>
        getViewIdToDisplay(state)(ViewType.TicketList)
    )

    const viewId = useMemo(
        () => urlViewId ?? defaultViewId!.toString(),
        [defaultViewId, urlViewId]
    )

    const panelsConfig: Config = [
        [238, 200, 350],
        [300, 300, 450],
        [Infinity, 100, Infinity],
    ]

    return (
        <Panels config={panelsConfig}>
            <Panel>
                <TicketNavbar disableResize />
            </Panel>
            <Panel>
                <TicketListView viewId={viewId} />
            </Panel>
            <Panel>
                <EmptyTicket />
            </Panel>
        </Panels>
    )
}
