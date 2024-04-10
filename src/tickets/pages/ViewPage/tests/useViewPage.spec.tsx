import {renderHook} from '@testing-library/react-hooks'
import React from 'react'

import {useIsOnboardingHidden} from 'common/onboarding'
import {MOBILE_BREAKPOINT} from 'hooks/useIsMobileResolution/constants'
import {
    DEFAULT_INFOBAR_WIDTH,
    DEFAULT_NAVBAR_WIDTH,
    LayoutKeys,
} from 'split-ticket-view/constants'

import useViewPage from '../useViewPage'

jest.mock('common/onboarding', () => ({
    useIsOnboardingHidden: jest.fn(),
}))
const useOnboardingVisibilityMock = useIsOnboardingHidden as jest.Mock

jest.mock('pages/tickets/navbar/TicketNavbar', () => () => <p>TicketNavbar</p>)
jest.mock('pages/tickets/list/TicketList', () => () => <p>TicketList</p>)
jest.mock('pages/tickets/list/OnboardingSidePanel', () => () => (
    <p>OnboardingSidePanel</p>
))

describe('useViewPage', () => {
    beforeEach(() => {
        useOnboardingVisibilityMock.mockReturnValue([false, jest.fn()])
    })

    it('should return the config for the 3-panel layout', () => {
        global.innerWidth = 1500

        const {result} = renderHook(() => useViewPage())
        expect(result.current).toEqual(
            expect.objectContaining({
                config: [
                    expect.objectContaining({
                        key: 'navbar-panel',
                        panelConfig: [DEFAULT_NAVBAR_WIDTH, 200, 350],
                    }),
                    expect.objectContaining({
                        key: 'ticket-list-panel',
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
            })
        )
    })

    it('should return the config for the 2-panel layout', () => {
        useOnboardingVisibilityMock.mockReturnValue([true, jest.fn()])
        global.innerWidth = 1500

        const {result} = renderHook(() => useViewPage())
        expect(result.current).toEqual(
            expect.objectContaining({
                config: [
                    expect.objectContaining({
                        key: 'navbar-panel',
                        panelConfig: [DEFAULT_NAVBAR_WIDTH, 200, 350],
                    }),
                    expect.objectContaining({
                        key: 'ticket-list-panel',
                        panelConfig: [Infinity, 300],
                    }),
                ],
                layoutKey: LayoutKeys.FULL_TICKET,
            })
        )
    })
})
