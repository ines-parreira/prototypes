import {renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {useRouteMatch} from 'react-router-dom'

import {
    DEFAULT_NAVBAR_WIDTH,
    DEFAULT_TICKET_PANEL_WIDTH,
    LayoutKeys,
} from 'split-ticket-view/constants'

import useSplitViewPage from '../useSplitViewPage'

jest.mock('react-router-dom', () => ({
    useRouteMatch: jest.fn(),
}))
const useRouteMatchMock = useRouteMatch as jest.Mock

jest.mock('pages/tickets/navbar/TicketNavbar', () => () => <p>TicketNavbar</p>)
jest.mock('split-ticket-view/components/DefaultViewFallback', () => () => (
    <p>DefaultViewFallback</p>
))
jest.mock('ticket-page', () => ({
    EmptyTicket: () => <p>EmptyTicket</p>,
}))

describe('useSplitViewPage', () => {
    beforeEach(() => {
        useRouteMatchMock.mockReturnValue({params: {viewId: '123456'}})
    })

    it('should return the config', () => {
        const {result} = renderHook(() => useSplitViewPage())
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
                    panelConfig: [Infinity, 100, Infinity],
                }),
            ],

            layoutKey: LayoutKeys.VIEW,
        })
    })
})
