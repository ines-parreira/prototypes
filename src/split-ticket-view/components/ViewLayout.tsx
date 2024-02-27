import React from 'react'
import {RouteComponentProps} from 'react-router-dom'

import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import {Config, Panel, Panels} from 'panels'
import {EmptyTicket} from 'ticket-page'

import storePanelWidths from '../utils/storePanelWidths'
import createInitialConfig from '../utils/createInitialConfig'
import {LayoutKeys} from '../constants'
import DefaultViewFallback from './DefaultViewFallback'

const defaultPanelsConfig: Config = [
    [238, 200, 350],
    [300, 300, 450],
    [Infinity, 100, Infinity],
]

const initialConfig = () =>
    createInitialConfig(LayoutKeys.VIEW, defaultPanelsConfig)

const handleResize = (widths: number[]) => {
    storePanelWidths(LayoutKeys.VIEW, widths)
}

type Params = {
    viewId?: string
}

export const ViewLayout = ({
    match: {
        params: {viewId},
    },
}: RouteComponentProps<Params>) => {
    return (
        <Panels config={initialConfig()} onResize={handleResize}>
            <Panel>
                <TicketNavbar disableResize />
            </Panel>
            <Panel>
                <DefaultViewFallback viewId={viewId} />
            </Panel>
            <Panel>
                <EmptyTicket />
            </Panel>
        </Panels>
    )
}

export default ViewLayout
