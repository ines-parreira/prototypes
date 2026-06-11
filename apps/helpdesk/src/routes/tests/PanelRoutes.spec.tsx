import type { ReactElement } from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { Panels } from '@repo/layout'
import { NavigationProvider } from '@repo/navigation'
import { assumeMock, render } from '@repo/testing'
import { useHelpdeskV2MS4Dot5Flag } from '@repo/tickets/feature-flags'
import { act, screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Router } from 'react-router-dom'
import { useIsMobileResolution, useWindowSize } from '@gorgias/toolkit-react'

import { NavBarDisplayMode } from 'common/navigation/hooks/useNavBar/context'
import { useNavBar } from 'common/navigation/hooks/useNavBar/useNavBar'
import { account } from 'fixtures/account'
import { ticket } from 'fixtures/ticket'
import { user } from 'fixtures/users'
import { useVoiceDevice } from 'hooks/integrations/phone/useVoiceDevice'
import type { VoiceDeviceContextState } from 'pages/integrations/integration/components/voice/VoiceDeviceContext'
import { useSplitTicketView } from 'split-ticket-view-toggle'

import { PanelRoutes } from '../PanelRoutes'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn().mockReturnValue(false),
    useAreFlagsLoading: jest.fn().mockReturnValue(false),
}))

const useHelpdeskV2WayfindingMS1FlagMock = assumeMock(
    useHelpdeskV2WayfindingMS1Flag,
)

jest.mock('@repo/tickets/feature-flags', () => ({
    ...jest.requireActual('@repo/tickets/feature-flags'),
    useHelpdeskV2MS1Flag: jest.fn().mockReturnValue(false),
    useHelpdeskV2MS1Dot5Flag: jest.fn().mockReturnValue(false),
    useHelpdeskV2MS4Dot5Flag: jest.fn().mockReturnValue(false),
}))
const useHelpdeskV2MS4Dot5FlagMock = assumeMock(useHelpdeskV2MS4Dot5Flag)

jest.mock('core/navigation', () => ({
    GlobalNavigationPanel: () => <div>GlobalNavigationPanel</div>,
}))
jest.mock('hooks/integrations/phone/useVoiceDevice')
const useVoiceDeviceMock = assumeMock(useVoiceDevice)

jest.mock('@gorgias/toolkit-react', () => ({
    ...jest.requireActual('@gorgias/toolkit-react'),
    useWindowSize: jest.fn(),
    useIsMobileResolution: jest.fn(),
}))
const useWindowSizeMock = assumeMock(useWindowSize)
const useIsMobileResolutionMock = assumeMock(useIsMobileResolution)
jest.mock('common/navigation/hooks/useNavBar/useNavBar')
const useNavBarMock = assumeMock(useNavBar)
jest.mock('split-ticket-view-toggle')
const useSplitTicketViewMock = assumeMock(useSplitTicketView)
jest.mock('tickets/navigation', () => ({
    TicketsNavbarPanel: () => <div>TicketsNavbarPanel</div>,
}))
jest.mock('tickets/ticket-detail', () => ({
    TicketDetailPanel: () => <div>TicketDetailPanel</div>,
}))
jest.mock('tickets/ticket-empty', () => ({
    TicketEmptyPanel: () => <div>TicketEmptyPanel</div>,
}))
jest.mock('tickets/ticket-infobar', () => ({
    TicketInfobarPanel: () => <div>TicketInfobarPanel</div>,
}))
jest.mock('tickets/tickets-list', () => ({
    TicketsListPanel: () => <div>TicketsListPanel</div>,
}))
let mockViewPanelMountCounter = 0
jest.mock('tickets/view', () => ({
    ViewPanelEntrypoint: () => {
        const { useState } = require('react')
        const [mountId] = useState(() => {
            mockViewPanelMountCounter += 1
            return mockViewPanelMountCounter
        })

        return (
            <div>
                <span>ViewPanel</span>
                <span>ViewPanel mount: {mountId}</span>
            </div>
        )
    },
}))

jest.mock('../MobileRoutes', () => ({
    MobileRoutes: () => <div>MobileRoutes</div>,
}))

const renderPanelRoutes = (
    element: ReactElement,
    {
        initialEntry = '/app',
        path = '*',
        storeState = {},
    }: {
        initialEntry?: string
        path?: string
        storeState?: object
    } = {},
) =>
    render(element, {
        initialEntries: [initialEntry],
        path,
        storeState,
        wrapper: ({ children }) => (
            <NavigationProvider>{children}</NavigationProvider>
        ),
    })

const renderPanelRoutesWithHistory = (initialEntry: string) => {
    const history = createMemoryHistory({ initialEntries: [initialEntry] })

    return {
        history,
        ...render(
            <Router history={history}>
                <NavigationProvider>
                    <PanelRoutes />
                </NavigationProvider>
            </Router>,
        ),
    }
}

describe('PanelRoutes', () => {
    beforeEach(() => {
        mockViewPanelMountCounter = 0
        useVoiceDeviceMock.mockReturnValue({
            call: null,
            device: null,
            actions: {},
        } as unknown as VoiceDeviceContextState)
        useIsMobileResolutionMock.mockReturnValue(false)
        useWindowSizeMock.mockReturnValue({ width: 1000, height: 1000 })
        useNavBarMock.mockReturnValue({
            navBarDisplay: NavBarDisplayMode.Open,
            setNavBarDisplay: jest.fn(),
        } as any)
        useSplitTicketViewMock.mockReturnValue({
            isEnabled: true,
            setIsEnabled: jest.fn(),
        } as any)
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(false)
    })

    const expectViewPanelMount = (mountId: number) => {
        expect(
            screen.getByText(`ViewPanel mount: ${mountId}`),
        ).toBeInTheDocument()
    }

    it('should render the mobile routes for mobile resolutions', () => {
        useIsMobileResolutionMock.mockReturnValue(true)
        renderPanelRoutes(<PanelRoutes />)
        expect(screen.getByText('MobileRoutes')).toBeInTheDocument()
    })

    it('should render the global navigation', () => {
        renderPanelRoutes(<PanelRoutes />)
        expect(screen.getByText('GlobalNavigationPanel')).toBeInTheDocument()
    })

    it('should render the tickets navbar', () => {
        renderPanelRoutes(<PanelRoutes />)
        expect(screen.getByText('TicketsNavbarPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app', () => {
        renderPanelRoutes(<PanelRoutes />)
        expect(screen.getByText('ViewPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app/tickets', () => {
        renderPanelRoutes(<PanelRoutes />, { initialEntry: '/app/tickets' })
        expect(screen.getByText('ViewPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app/tickets/new/:visibility?', () => {
        renderPanelRoutes(<PanelRoutes />, {
            initialEntry: '/app/tickets/new/private',
        })
        expect(screen.getByText('ViewPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app/tickets/search', () => {
        renderPanelRoutes(<PanelRoutes />, {
            initialEntry: '/app/tickets/search',
        })
        expect(screen.getByText('ViewPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app/tickets/:viewId/:viewSlug?', () => {
        renderPanelRoutes(<PanelRoutes />, {
            initialEntry: '/app/tickets/123456/boop',
        })
        expect(screen.getByText('ViewPanel')).toBeInTheDocument()
    })

    it('should remount the view panel across MS4.5 ticket view contexts', () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)

        const { history } = renderPanelRoutesWithHistory('/app/tickets/search')
        expectViewPanelMount(1)

        act(() => {
            history.push('/app/tickets/new/private')
        })
        expectViewPanelMount(2)

        act(() => {
            history.push('/app/tickets/123')
        })
        expectViewPanelMount(3)

        act(() => {
            history.push('/app/tickets/456')
        })
        expectViewPanelMount(4)
    })

    it('should keep the stable saved view panel key when MS4.5 is disabled', () => {
        const { history } = renderPanelRoutesWithHistory('/app/tickets/123')
        expectViewPanelMount(1)

        act(() => {
            history.push('/app/tickets/456')
        })
        expectViewPanelMount(1)
    })

    it('should render the correct panels for /app/ticket/:ticketId', () => {
        renderPanelRoutes(<PanelRoutes />, {
            initialEntry: '/app/ticket/123456',
            storeState: {
                currentUser: fromJS(user),
                currentAccount: fromJS(account),
                ticket: fromJS(ticket),
            },
        })
        expect(screen.getByText('TicketDetailPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketInfobarPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app/views/:viewId?', () => {
        renderPanelRoutes(<PanelRoutes />, {
            initialEntry: '/app/views/123456',
        })
        expect(screen.getByText('TicketsListPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketEmptyPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app/views/:viewId/:ticketId', () => {
        renderPanelRoutes(<PanelRoutes />, {
            initialEntry: '/app/views/123456/789987',
            storeState: {
                currentUser: fromJS(user),
                currentAccount: fromJS(account),
                ticket: fromJS(ticket),
            },
        })
        expect(screen.getByText('TicketsListPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketDetailPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketInfobarPanel')).toBeInTheDocument()
    })

    describe('with wayfinding flag enabled', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('should not render GlobalNavigationPanel or TicketsNavbarPanel when wayfinding flag is enabled', () => {
            renderPanelRoutes(
                <Panels size={100}>
                    <PanelRoutes />
                </Panels>,
            )
            expect(
                screen.queryByText('GlobalNavigationPanel'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('TicketsNavbarPanel'),
            ).not.toBeInTheDocument()
        })
    })
})
