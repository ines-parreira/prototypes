import React from 'react'
import {RouteComponentProps} from 'react-router-dom'

import TicketDetail from 'pages/tickets/detail/TicketDetailContainer'
import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import TicketInfobarContainer from 'pages/tickets/detail/TicketInfobarContainer'
import {Config, Panel, Panels} from 'panels'

import storePanelWidths from '../utils/storePanelWidths'
import createInitialConfig from '../utils/createInitialConfig'
import {LayoutKeys} from '../constants'
import DefaultViewFallback from './DefaultViewFallback'
import css from './TicketLayout.less'

const defaultPanelsConfig: Config = [
    [238, 200, 350],
    [300, 300, 450],
    [Infinity, 300],
    [Infinity, 340, 400],
]

const initialConfig = () =>
    createInitialConfig(LayoutKeys.TICKET, defaultPanelsConfig)

const handleResize = (widths: number[]) => {
    storePanelWidths(LayoutKeys.TICKET, widths)
}

type Params = {
    viewId: string
}

export default function TicketLayout({
    match: {
        params: {viewId},
    },
}: RouteComponentProps<Params>) {
    return (
        <Panels config={initialConfig()} onResize={handleResize}>
            <Panel>
                <TicketNavbar disableResize />
            </Panel>
            <Panel>
                <DefaultViewFallback viewId={viewId} />
            </Panel>
            <Panel className={css.container}>
                <TicketDetail />
            </Panel>
            <Panel>
                <TicketInfobarContainer isOnNewLayout />
            </Panel>
        </Panels>
    )
}
