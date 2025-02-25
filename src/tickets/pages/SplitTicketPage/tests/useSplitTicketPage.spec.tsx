import React from 'react'

import { renderHook } from '@testing-library/react-hooks'
import { useRouteMatch } from 'react-router-dom'

import {
    DEFAULT_INFOBAR_WIDTH,
    DEFAULT_NAVBAR_WIDTH,
    DEFAULT_TICKET_PANEL_WIDTH,
    LayoutKeys,
} from 'split-ticket-view/constants'

import useSplitTicketPage from '../useSplitTicketPage'

jest.mock('react-router-dom', () => ({
    useRouteMatch: jest.fn(),
}))
const useRouteMatchMock = useRouteMatch as jest.Mock

jest.mock('pages/tickets/navbar/TicketNavbar', () => () => <p>TicketNavbar</p>)
jest.mock('pages/tickets/detail/TicketInfobarContainer', () => () => (
    <p>TicketInfobarContainer</p>
))
jest.mock('split-ticket-view/components/DefaultViewFallback', () => () => (
    <p>DefaultViewFallback</p>
))
jest.mock('split-ticket-view/components/TicketWrapper', () => () => (
    <p>TicketWrapper</p>
))

describe('useSplitViewPage', () => {
    beforeEach(() => {
        useRouteMatchMock.mockReturnValue({
            params: { ticketId: '654321', viewId: '123456' },
        })
    })

    it('should return the config', () => {
        global.innerWidth = 1500

        const { result } = renderHook(() => useSplitTicketPage())
        expect(result.current).toEqual({
            config: [
                expect.objectContaining({
                    key: 'navbar-panel',
                    panelConfig: [DEFAULT_NAVBAR_WIDTH, 200, 350],
                }),
                expect.objectContaining({
                    key: 'ticket-list-panel-123456',
                    panelConfig: [
                        DEFAULT_TICKET_PANEL_WIDTH,
                        DEFAULT_TICKET_PANEL_WIDTH,
                        450,
                    ],
                }),
                expect.objectContaining({
                    key: 'ticket-panel',
                    panelConfig: [Infinity, 300],
                }),
                expect.objectContaining({
                    key: 'infobar-panel',
                    panelConfig: [
                        DEFAULT_INFOBAR_WIDTH,
                        DEFAULT_INFOBAR_WIDTH,
                        750,
                    ],
                }),
            ],

            layoutKey: LayoutKeys.TICKET,
        })
    })
})
