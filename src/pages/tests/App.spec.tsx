import {render} from '@testing-library/react'
import React from 'react'

import {Provider} from 'react-redux'

import {NavBarProvider} from 'common/navigation/components/NavBarProvider'
import {store} from 'common/store'
import {useFlag} from 'core/flags'
import useIsMobileResolution from 'hooks/useIsMobileResolution/useIsMobileResolution'

import App from '../App'

jest.mock('core/flags')
jest.mock('hooks/useIsMobileResolution/useIsMobileResolution')
jest.mock('common/navigation', () => ({
    GlobalNavigation: jest.fn(() => <div data-testid="global-navigation" />),
}))

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>
const mockUseIsMobileResolution = useIsMobileResolution as jest.MockedFunction<
    typeof useIsMobileResolution
>

describe('App Navbar rendering', () => {
    const MockNavbar = () => <div data-testid="navbar">Navbar Content</div>

    const renderWithContext = (component: React.ReactNode) => {
        return render(
            <Provider store={store}>
                <NavBarProvider>{component}</NavBarProvider>
            </Provider>
        )
    }

    it('display the navbar container when global nav is enabled and not mobile', () => {
        mockUseFlag.mockReturnValue(true)
        mockUseIsMobileResolution.mockReturnValue(false)

        const {getByTestId, container} = renderWithContext(
            <App navbar={MockNavbar} />
        )

        expect(getByTestId('global-navigation')).toBeInTheDocument()
        expect(getByTestId('navbar')).toBeInTheDocument()
        expect(
            container.querySelector(
                '[data-name="navbar-collapsible-container"]'
            )
        ).not.toBeInTheDocument()
    })

    it('renders Navbar directly when global nav is disabled', () => {
        mockUseFlag.mockReturnValue(false)
        mockUseIsMobileResolution.mockReturnValue(false)

        const {queryByTestId, getByTestId, container} = renderWithContext(
            <App navbar={MockNavbar} />
        )

        expect(queryByTestId('global-navigation')).not.toBeInTheDocument()
        expect(
            container.querySelector(
                '[data-name="navbar-collapsible-container"]'
            )
        ).not.toBeInTheDocument()
        expect(getByTestId('navbar')).toBeInTheDocument()
    })

    it('renders Navbar directly when on mobile resolution', () => {
        mockUseFlag.mockReturnValue(true)
        mockUseIsMobileResolution.mockReturnValue(true)

        const {queryByTestId, getByTestId, container} = renderWithContext(
            <App navbar={MockNavbar} />
        )

        expect(queryByTestId('global-navigation')).not.toBeInTheDocument()
        expect(
            container.querySelector(
                '[data-name="navbar-collapsible-container"]'
            )
        ).not.toBeInTheDocument()
        expect(getByTestId('navbar')).toBeInTheDocument()
    })

    it('does not render Navbar when no navbar prop is provided', () => {
        mockUseFlag.mockReturnValue(true)
        mockUseIsMobileResolution.mockReturnValue(false)

        const {container} = renderWithContext(<App />)

        expect(
            container.querySelector('[data-name="navbar-container"]')
        ).not.toBeInTheDocument()
    })
})
