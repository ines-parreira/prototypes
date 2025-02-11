import {render, act, fireEvent} from '@testing-library/react'
import React from 'react'

import {
    NavBarDisplayMode,
    NavBarContextType,
} from '../../hooks/useNavBar/context'
import {useNavBar} from '../../hooks/useNavBar/useNavBar'

import {NAVBAR_DISPLAY_KEY, NavBarProvider} from '../NavBarProvider'

// Updated Test component with interactive buttons
function TestComponent() {
    const navBar = useNavBar()
    return (
        <div data-testid="test-component" data-state={JSON.stringify(navBar)}>
            <button data-testid="home-button" onClick={navBar.onMenuToggle}>
                Home
            </button>
            <div
                data-testid="navbar-area"
                onMouseEnter={navBar.onNavHover}
                onMouseLeave={navBar.onNavLeave}
            >
                Navbar Area
            </div>
            <div
                data-testid="overlay-area"
                onMouseEnter={navBar.onOverlayHover}
            >
                Overlay Area
            </div>
        </div>
    )
}

describe('NavBarProvider', () => {
    beforeEach(() => {
        localStorage.removeItem(NAVBAR_DISPLAY_KEY)
    })

    it('provides initial state', () => {
        const {getByTestId} = render(
            <NavBarProvider>
                <TestComponent />
            </NavBarProvider>
        )

        const state = JSON.parse(
            getByTestId('test-component').dataset.state!
        ) as NavBarContextType
        expect(state.navBarDisplay).toBe(NavBarDisplayMode.Open)
        expect(state.isNavBarVisible).toBe(true)
        expect(state.isNavHovered).toBe(false)
    })

    it('handles hover enter/leave correctly without freeze', () => {
        const {getByTestId} = render(
            <NavBarProvider>
                <TestComponent />
            </NavBarProvider>
        )

        const navbarArea = getByTestId('navbar-area')
        const getState = () =>
            JSON.parse(
                getByTestId('test-component').dataset.state!
            ) as NavBarContextType

        // Initial state should be Open
        expect(getState().navBarDisplay).toBe(NavBarDisplayMode.Open)
        expect(getState().isNavHovered).toBe(false)

        act(() => {
            fireEvent.mouseEnter(navbarArea)
        })

        expect(getState().isNavHovered).toBe(true)
        expect(getState().navBarDisplay).toBe(NavBarDisplayMode.Open)

        act(() => {
            fireEvent.mouseLeave(navbarArea)
        })

        expect(getState().isNavHovered).toBe(false)
        expect(getState().navBarDisplay).toBe(NavBarDisplayMode.Open)
    })

    it('handles home button click correctly', () => {
        const {getByTestId} = render(
            <NavBarProvider>
                <TestComponent />
            </NavBarProvider>
        )

        const homeButton = getByTestId('home-button')
        const getState = () =>
            JSON.parse(
                getByTestId('test-component').dataset.state!
            ) as NavBarContextType

        act(() => {
            homeButton.click()
        })
        expect(getState().navBarDisplay).toBe(NavBarDisplayMode.Collapsed)

        act(() => {
            homeButton.click()
        })
        expect(getState().navBarDisplay).toBe(NavBarDisplayMode.Open)
    })

    it('maintains open state during hover events', () => {
        const {getByTestId} = render(
            <NavBarProvider>
                <TestComponent />
            </NavBarProvider>
        )

        const navbarArea = getByTestId('navbar-area')
        const getState = () =>
            JSON.parse(
                getByTestId('test-component').dataset.state!
            ) as NavBarContextType

        act(() => {
            fireEvent.mouseEnter(navbarArea)
        })
        expect(getState().navBarDisplay).toBe(NavBarDisplayMode.Open)

        act(() => {
            fireEvent.mouseLeave(navbarArea)
        })
        expect(getState().navBarDisplay).toBe(NavBarDisplayMode.Open)
    })

    it('handles hover events with freeze behavior', async () => {
        const {getByTestId} = render(
            <NavBarProvider>
                <TestComponent />
            </NavBarProvider>
        )

        const homeButton = getByTestId('home-button')
        const navbarArea = getByTestId('navbar-area')
        const getState = () =>
            JSON.parse(
                getByTestId('test-component').dataset.state!
            ) as NavBarContextType

        // Click home button to collapse and freeze
        act(() => {
            homeButton.click()
        })
        expect(getState().navBarDisplay).toBe(NavBarDisplayMode.Collapsed)

        // Immediate hover should not affect the navbar due to freeze
        act(() => {
            fireEvent.mouseEnter(navbarArea)
        })
        expect(getState().isNavHovered).toBe(false)
        expect(getState().navBarDisplay).toBe(NavBarDisplayMode.Collapsed)

        // Wait for freeze timeout
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Now hover should work
        act(() => {
            fireEvent.mouseEnter(navbarArea)
        })
        expect(getState().isNavHovered).toBe(true)
        expect(getState().navBarDisplay).toBe(NavBarDisplayMode.Hover)
    })
})
