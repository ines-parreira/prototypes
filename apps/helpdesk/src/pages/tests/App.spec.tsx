import type React from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { useIsMobileResolution } from '@repo/hooks'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import { assumeMock, render } from '@repo/testing'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'

import { CopilotWorkspace } from '@gorgias/copilot'

import { copilotAttachmentsConfig } from 'common/copilot/copilotAttachmentsConfig'
import { NavBarProvider } from 'common/navigation/components/NavBarProvider'
import { store } from 'common/store'
import { useCopilotEnabled } from 'hooks/useCopilotEnabled'
import { openPanel } from 'state/layout/actions'

import App from '../App'

jest.mock('@gorgias/copilot')

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn().mockReturnValue(false),
}))

const useHelpdeskV2WayfindingMS1FlagMock = assumeMock(
    useHelpdeskV2WayfindingMS1Flag,
)

jest.mock('@repo/navigation', () => ({
    ...jest.requireActual('@repo/navigation'),
    useTicketInfobarNavigation: jest.fn(),
}))
const useTicketInfobarNavigationMock = useTicketInfobarNavigation as jest.Mock

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useIsMobileResolution: jest.fn(),
}))
jest.mock('common/navigation', () => ({
    GlobalNavigation: jest.fn(() => <div data-testid="global-navigation" />),
}))

jest.mock(
    'domains/reporting/hooks/managed-dashboards/useFetchManagedDashboards',
    () => ({
        useFetchManagedDashboards: jest.fn(),
    }),
)

jest.mock('hooks/useCopilotEnabled', () => ({
    useCopilotEnabled: jest.fn(() => false),
}))

const mockUseCopilotEnabled = assumeMock(useCopilotEnabled)
const mockCopilotWorkspace = assumeMock(CopilotWorkspace)
const mockUseIsMobileResolution = useIsMobileResolution as jest.MockedFunction<
    typeof useIsMobileResolution
>

describe('App Navbar rendering', () => {
    const MockNavbar = () => <div data-testid="navbar">Navbar Content</div>

    const renderWithContext = (component: React.ReactNode) => {
        return render(
            <Provider store={store}>
                <NavBarProvider>{component}</NavBarProvider>
            </Provider>,
        )
    }

    let onChangeTab: jest.Mock

    beforeEach(() => {
        onChangeTab = jest.fn()
        mockUseCopilotEnabled.mockReturnValue(false)
        mockCopilotWorkspace.mockClear()
        useTicketInfobarNavigationMock.mockReturnValue({
            activeTab: TicketInfobarTab.Customer,
            onChangeTab,
        })
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
    })

    it('display the navbar container when global nav is enabled and not mobile', () => {
        mockUseIsMobileResolution.mockReturnValue(false)

        const { getByTestId, container } = renderWithContext(
            <App navbar={MockNavbar} />,
        )

        expect(getByTestId('global-navigation')).toBeInTheDocument()
        expect(getByTestId('navbar')).toBeInTheDocument()
        expect(
            container.querySelector(
                '[data-name="navbar-collapsible-container"]',
            ),
        ).not.toBeInTheDocument()
    })

    it('renders Navbar directly when on mobile resolution', () => {
        mockUseIsMobileResolution.mockReturnValue(true)

        const { queryByTestId, getByTestId, container } = renderWithContext(
            <App navbar={MockNavbar} />,
        )

        expect(queryByTestId('global-navigation')).not.toBeInTheDocument()
        expect(
            container.querySelector(
                '[data-name="navbar-collapsible-container"]',
            ),
        ).not.toBeInTheDocument()
        expect(getByTestId('navbar')).toBeInTheDocument()
    })

    it('does not render Navbar when no navbar prop is provided', () => {
        mockUseIsMobileResolution.mockReturnValue(false)

        const { container } = renderWithContext(<App />)

        expect(
            container.querySelector('[data-name="navbar-container"]'),
        ).not.toBeInTheDocument()
    })

    describe('with wayfinding flag enabled', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('should not render GlobalNavigation or Navbar when wayfinding flag is enabled', () => {
            mockUseIsMobileResolution.mockReturnValue(false)

            const { queryByTestId } = renderWithContext(
                <App navbar={MockNavbar} />,
            )

            expect(queryByTestId('global-navigation')).not.toBeInTheDocument()
            expect(queryByTestId('navbar')).not.toBeInTheDocument()
        })

        it('should not render GlobalNavigation or Navbar on mobile when wayfinding flag is enabled', () => {
            mockUseIsMobileResolution.mockReturnValue(true)

            const { queryByTestId } = renderWithContext(
                <App navbar={MockNavbar} />,
            )

            expect(queryByTestId('global-navigation')).not.toBeInTheDocument()
            expect(queryByTestId('navbar')).not.toBeInTheDocument()
        })
    })

    it('passes image attachment settings to copilot workspace when copilot is enabled', () => {
        mockUseIsMobileResolution.mockReturnValue(false)
        mockUseCopilotEnabled.mockReturnValue(true)

        renderWithContext(<App />)

        expect(mockCopilotWorkspace.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                attachmentsConfig: copilotAttachmentsConfig,
            }),
        )
    })
})

describe('App mobile-nav rendering', () => {
    let dispatchSpy: jest.SpyInstance

    const renderWithContext = (component: React.ReactNode) => {
        return render(
            <Provider store={store}>
                <NavBarProvider>{component}</NavBarProvider>
            </Provider>,
        )
    }

    beforeEach(() => {
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
        mockUseIsMobileResolution.mockReturnValue(false)
        ;(useTicketInfobarNavigation as jest.Mock).mockReturnValue({
            activeTab: TicketInfobarTab.Customer,
            onChangeTab: jest.fn(),
        })
    })

    afterEach(() => {
        dispatchSpy?.mockRestore()
    })

    it('should render mobile-nav menu button when wayfinding flag is disabled', () => {
        const { getByRole } = renderWithContext(<App />)

        expect(getByRole('button', { name: /menu/i })).toBeInTheDocument()
    })

    it('should not render mobile-nav menu button when wayfinding flag is enabled', () => {
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)

        const { queryByRole } = renderWithContext(<App />)

        expect(queryByRole('button', { name: /menu/i })).not.toBeInTheDocument()
    })

    it('should show "More info" button when infobarOnMobile is true', () => {
        const { getByRole } = renderWithContext(<App infobarOnMobile />)

        expect(getByRole('button', { name: /more info/i })).toBeInTheDocument()
    })

    it('should not show "More info" button when infobarOnMobile is not set', () => {
        const { queryByRole } = renderWithContext(<App />)

        expect(
            queryByRole('button', { name: /more info/i }),
        ).not.toBeInTheDocument()
    })

    it('should not show "More info" button when wayfinding flag is enabled even if infobarOnMobile is true', () => {
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)

        const { queryByRole } = renderWithContext(<App infobarOnMobile />)

        expect(
            queryByRole('button', { name: /more info/i }),
        ).not.toBeInTheDocument()
    })

    it('should dispatch openPanel navbar when menu button is clicked', async () => {
        const user = userEvent.setup()
        dispatchSpy = jest.spyOn(store, 'dispatch')

        const { getByRole } = renderWithContext(<App />)

        await user.click(getByRole('button', { name: /menu/i }))

        expect(dispatchSpy).toHaveBeenCalledWith(openPanel('navbar'))
    })

    it('should dispatch openPanel infobar when "More info" button is clicked', async () => {
        const user = userEvent.setup()
        dispatchSpy = jest.spyOn(store, 'dispatch')

        const { getByRole } = renderWithContext(<App infobarOnMobile />)

        await user.click(getByRole('button', { name: /more info/i }))

        expect(dispatchSpy).toHaveBeenCalledWith(openPanel('infobar'))
    })
})
