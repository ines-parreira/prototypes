import { logEvent, SegmentEvent } from '@repo/logging'
import { act, fireEvent, render } from '@testing-library/react'

import type { NavBarContextType } from '../../hooks/useNavBar/context'
import { NavBarDisplayMode } from '../../hooks/useNavBar/context'
import { useNavBar } from '../../hooks/useNavBar/useNavBar'
import { NAVBAR_DISPLAY_KEY, NavBarProvider } from '../NavBarProvider'

jest.mock('@repo/logging')

// Updated Test component with interactive buttons
function TestComponent() {
    const navBar = useNavBar()
    return (
        <div data-testid="test-component" data-state={JSON.stringify(navBar)}>
            <button data-testid="home-button" onClick={navBar.onMenuToggle}>
                Home
            </button>
            <button
                data-testid="toggle-navbar-button"
                onClick={navBar.onNavBarShortCutToggle}
            >
                Toggle Navbar
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
        jest.useFakeTimers()
        localStorage.removeItem(NAVBAR_DISPLAY_KEY)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('provides initial state', () => {
        const { getByTestId } = render(
            <NavBarProvider>
                <TestComponent />
            </NavBarProvider>,
        )

        const state = JSON.parse(
            getByTestId('test-component').dataset.state!,
        ) as NavBarContextType
        expect(state.navBarDisplay).toBe(NavBarDisplayMode.Open)
        expect(state.isNavBarVisible).toBe(true)
        expect(state.isNavHovered).toBe(false)
    })

    it('handles hover enter/leave correctly without freeze', () => {
        const { getByTestId } = render(
            <NavBarProvider>
                <TestComponent />
            </NavBarProvider>,
        )

        const navbarArea = getByTestId('navbar-area')
        const getState = () =>
            JSON.parse(
                getByTestId('test-component').dataset.state!,
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

    it('maintains open state during hover events', () => {
        const { getByTestId } = render(
            <NavBarProvider>
                <TestComponent />
            </NavBarProvider>,
        )

        const navbarArea = getByTestId('navbar-area')
        const getState = () =>
            JSON.parse(
                getByTestId('test-component').dataset.state!,
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

    it('handles hover events with freeze behavior', () => {
        const { getByTestId } = render(
            <NavBarProvider>
                <TestComponent />
            </NavBarProvider>,
        )

        const homeButton = getByTestId('home-button')
        const navbarArea = getByTestId('navbar-area')
        const getState = () =>
            JSON.parse(
                getByTestId('test-component').dataset.state!,
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

        // Wait for freeze timeout using fake timers
        act(() => {
            jest.advanceTimersByTime(1000)
        })

        // Now hover should work
        act(() => {
            fireEvent.mouseEnter(navbarArea)
        })
        expect(getState().isNavHovered).toBe(true)
        expect(getState().navBarDisplay).toBe(NavBarDisplayMode.Hover)
    })

    it('handles overlay hover correctly', () => {
        const { getByTestId } = render(
            <NavBarProvider>
                <TestComponent />
            </NavBarProvider>,
        )

        const overlayArea = getByTestId('overlay-area')
        const navbarArea = getByTestId('navbar-area')
        const homeButton = getByTestId('home-button')
        const getState = () =>
            JSON.parse(
                getByTestId('test-component').dataset.state!,
            ) as NavBarContextType

        // First collapse the navbar from its default Open state
        act(() => {
            homeButton.click()
        })
        expect(getState().navBarDisplay).toBe(NavBarDisplayMode.Collapsed)

        // Wait for freeze timeout using fake timers
        act(() => {
            jest.advanceTimersByTime(800)
        })

        // Then set navbar to Hover mode
        act(() => {
            fireEvent.mouseEnter(navbarArea)
        })
        expect(getState().navBarDisplay).toBe(NavBarDisplayMode.Hover)

        // Then hover over overlay
        act(() => {
            fireEvent.mouseEnter(overlayArea)
        })

        expect(getState().navBarDisplay).toBe(NavBarDisplayMode.Collapsed)
        expect(getState().isNavHovered).toBe(false)
    })

    it('persists navbar state in localStorage', () => {
        const { getByTestId, rerender } = render(
            <NavBarProvider>
                <TestComponent />
            </NavBarProvider>,
        )

        const homeButton = getByTestId('home-button')
        const getState = () =>
            JSON.parse(
                getByTestId('test-component').dataset.state!,
            ) as NavBarContextType

        // Change state
        act(() => {
            homeButton.click()
        })
        expect(getState().navBarDisplay).toBe(NavBarDisplayMode.Collapsed)

        // Verify localStorage
        expect(localStorage.getItem(NAVBAR_DISPLAY_KEY)).toBe('"collapsed"')

        // Unmount and remount to verify persistence
        rerender(
            <NavBarProvider>
                <TestComponent />
            </NavBarProvider>,
        )

        expect(getState().navBarDisplay).toBe(NavBarDisplayMode.Collapsed)
    })

    it('handles navbar shortcut toggle correctly', () => {
        const { getByTestId } = render(
            <NavBarProvider>
                <TestComponent />
            </NavBarProvider>,
        )

        const toggleButton = getByTestId('toggle-navbar-button')
        const getState = () =>
            JSON.parse(
                getByTestId('test-component').dataset.state!,
            ) as NavBarContextType

        // Initial state should be Open
        expect(getState().navBarDisplay).toBe(NavBarDisplayMode.Open)

        // Toggle to Collapsed
        act(() => {
            toggleButton.click()
        })
        expect(getState().navBarDisplay).toBe(NavBarDisplayMode.Collapsed)

        // Toggle back to Open
        act(() => {
            toggleButton.click()
        })
        expect(getState().navBarDisplay).toBe(NavBarDisplayMode.Open)
    })

    it('logs the correct event when the navbar is toggled', () => {
        const { getByTestId } = render(
            <NavBarProvider>
                <TestComponent />
            </NavBarProvider>,
        )

        const homeToggleButton = getByTestId('home-button')

        fireEvent.click(homeToggleButton)
        expect(logEvent).toHaveBeenLastCalledWith(
            SegmentEvent.NavigationPanelVisibilityStateToggled,
            { visible: false },
        )

        fireEvent.click(homeToggleButton)
        expect(logEvent).toHaveBeenLastCalledWith(
            SegmentEvent.NavigationPanelVisibilityStateToggled,
            { visible: true },
        )

        const shortcutToggleButton = getByTestId('toggle-navbar-button')

        fireEvent.click(shortcutToggleButton)
        expect(logEvent).toHaveBeenLastCalledWith(
            SegmentEvent.NavigationPanelVisibilityStateToggled,
            { visible: false },
        )

        fireEvent.click(shortcutToggleButton)
        expect(logEvent).toHaveBeenLastCalledWith(
            SegmentEvent.NavigationPanelVisibilityStateToggled,
            { visible: true },
        )
    })
})
