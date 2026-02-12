import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { useIsMobileResolution, useWindowSize } from '@repo/hooks'
import { Panels } from '@repo/layout'
import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { NavBarDisplayMode } from 'common/navigation/hooks/useNavBar/context'
import { useNavBar } from 'common/navigation/hooks/useNavBar/useNavBar'
import { account } from 'fixtures/account'
import { ticket } from 'fixtures/ticket'
import { user } from 'fixtures/users'
import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import type { VoiceDeviceContextState } from 'pages/integrations/integration/components/voice/VoiceDeviceContext'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import PanelRoutes from '../PanelRoutes'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn().mockReturnValue(false),
    useFlag: jest.fn().mockReturnValue(false),
}))

const useHelpdeskV2WayfindingMS1FlagMock = assumeMock(
    useHelpdeskV2WayfindingMS1Flag,
)

jest.mock('@repo/tickets', () => ({
    ...jest.requireActual('@repo/tickets'),
    useHelpdeskV2MS1Flag: jest.fn().mockReturnValue(false),
    useHelpdeskV2MS1Dot5Flag: jest.fn().mockReturnValue(false),
}))

jest.mock('core/navigation', () => ({
    GlobalNavigationPanel: () => <div>GlobalNavigationPanel</div>,
}))
jest.mock('hooks/integrations/phone/useVoiceDevice')
const useVoiceDeviceMock = assumeMock(useVoiceDevice)

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
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
jest.mock('tickets/view', () => ({
    ViewPanel: () => <div>ViewPanel</div>,
}))

jest.mock('../MobileRoutes', () => ({
    MobileRoutes: () => <div>MobileRoutes</div>,
}))

describe('PanelRoutes', () => {
    beforeEach(() => {
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
    })

    it('should render the mobile routes for mobile resolutions', () => {
        useIsMobileResolutionMock.mockReturnValue(true)
        renderWithStoreAndQueryClientAndRouter(
            <PanelRoutes />,
            {},
            { route: '/app', path: '*' },
        )
        expect(screen.getByText('MobileRoutes')).toBeInTheDocument()
    })

    it('should render the global navigation', () => {
        renderWithStoreAndQueryClientAndRouter(
            <PanelRoutes />,
            {},
            { route: '/app', path: '*' },
        )
        expect(screen.getByText('GlobalNavigationPanel')).toBeInTheDocument()
    })

    it('should render the tickets navbar', () => {
        renderWithStoreAndQueryClientAndRouter(
            <PanelRoutes />,
            {},
            { route: '/app', path: '*' },
        )
        expect(screen.getByText('TicketsNavbarPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app', () => {
        renderWithStoreAndQueryClientAndRouter(
            <PanelRoutes />,
            {},
            { route: '/app', path: '*' },
        )
        expect(screen.getByText('ViewPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app/tickets', () => {
        renderWithStoreAndQueryClientAndRouter(
            <PanelRoutes />,
            {},
            { route: '/app/tickets', path: '*' },
        )
        expect(screen.getByText('ViewPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app/tickets/new/:visibility?', () => {
        renderWithStoreAndQueryClientAndRouter(
            <PanelRoutes />,
            {},
            { route: '/app/tickets/new/private', path: '*' },
        )
        expect(screen.getByText('ViewPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app/tickets/search', () => {
        renderWithStoreAndQueryClientAndRouter(
            <PanelRoutes />,
            {},
            { route: '/app/tickets/search', path: '*' },
        )
        expect(screen.getByText('ViewPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app/tickets/:viewId/:viewSlug?', () => {
        renderWithStoreAndQueryClientAndRouter(
            <PanelRoutes />,
            {},
            { route: '/app/tickets/123456/boop', path: '*' },
        )
        expect(screen.getByText('ViewPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app/ticket/:ticketId', () => {
        renderWithStoreAndQueryClientAndRouter(
            <PanelRoutes />,
            {
                currentUser: fromJS(user),
                currentAccount: fromJS(account),
                ticket: fromJS(ticket),
            },
            { route: '/app/ticket/123456', path: '*' },
        )
        expect(screen.getByText('TicketDetailPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketInfobarPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app/views/:viewId?', () => {
        renderWithStoreAndQueryClientAndRouter(
            <PanelRoutes />,
            {},
            { route: '/app/views/123456', path: '*' },
        )
        expect(screen.getByText('TicketsListPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketEmptyPanel')).toBeInTheDocument()
    })

    it('should render the correct panels for /app/views/:viewId/:ticketId', () => {
        renderWithStoreAndQueryClientAndRouter(
            <PanelRoutes />,
            {
                currentUser: fromJS(user),
                currentAccount: fromJS(account),
                ticket: fromJS(ticket),
            },
            { route: '/app/views/123456/789987', path: '*' },
        )
        expect(screen.getByText('TicketsListPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketDetailPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketInfobarPanel')).toBeInTheDocument()
    })

    describe('with wayfinding flag enabled', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('should not render GlobalNavigationPanel or TicketsNavbarPanel when wayfinding flag is enabled', () => {
            renderWithStoreAndQueryClientAndRouter(
                <Panels size={100}>
                    <PanelRoutes />
                </Panels>,
                {},
                { route: '/app', path: '*' },
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
