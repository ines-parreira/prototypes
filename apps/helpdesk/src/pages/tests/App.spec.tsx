import React from 'react'

import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'

import { NavBarProvider } from 'common/navigation/components/NavBarProvider'
import { store } from 'common/store'
import useIsMobileResolution from 'hooks/useIsMobileResolution/useIsMobileResolution'

import App from '../App'

jest.mock('@repo/navigation', () => ({
    ...jest.requireActual('@repo/navigation'),
    useTicketInfobarNavigation: jest.fn(),
}))
const useTicketInfobarNavigationMock = useTicketInfobarNavigation as jest.Mock

jest.mock('hooks/useIsMobileResolution/useIsMobileResolution')
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
})
