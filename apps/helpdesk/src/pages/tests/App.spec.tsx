import type React from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { useIsMobileResolution } from '@repo/hooks'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'

import { NavBarProvider } from 'common/navigation/components/NavBarProvider'
import { store } from 'common/store'

import App from '../App'

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
})
