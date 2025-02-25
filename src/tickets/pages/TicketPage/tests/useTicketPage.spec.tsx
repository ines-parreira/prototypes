import React from 'react'

import { renderHook } from '@testing-library/react-hooks'

import { MOBILE_BREAKPOINT } from 'hooks/useIsMobileResolution/constants'
import {
    DEFAULT_INFOBAR_WIDTH,
    DEFAULT_NAVBAR_WIDTH,
    LayoutKeys,
} from 'split-ticket-view/constants'

import useTicketPage from '../useTicketPage'

jest.mock('pages/tickets/navbar/TicketNavbar', () => () => <p>TicketNavbar</p>)
jest.mock('pages/tickets/detail/TicketInfobarContainer', () => () => (
    <p>TicketInfobarContainer</p>
))
jest.mock('split-ticket-view/components/TicketWrapper', () => () => (
    <p>TicketWrapper</p>
))

describe('useSplitViewPage', () => {
    it('should return the config', () => {
        global.innerWidth = 1500

        const { result } = renderHook(() => useTicketPage())
        expect(result.current).toEqual(
            expect.objectContaining({
                config: [
                    expect.objectContaining({
                        key: 'navbar-panel',
                        panelConfig: [DEFAULT_NAVBAR_WIDTH, 200, 350],
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
                fallbackWidth: MOBILE_BREAKPOINT,
                layoutKey: LayoutKeys.FULL_TICKET,
            }),
        )
    })
})
