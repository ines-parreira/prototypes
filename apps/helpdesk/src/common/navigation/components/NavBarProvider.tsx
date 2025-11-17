import type { ReactNode } from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'

import { useLocalStorage, useTimeout } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'

import { NavBarContext, NavBarDisplayMode } from '../hooks/useNavBar/context'

export const NAVBAR_DISPLAY_KEY = 'navbar-display'

const FREEZE_TIMEOUT = 750

export function NavBarProvider({ children }: { children: ReactNode }) {
    const [isNavHovered, setIsNavHovered] = useState(false)
    const [navBarDisplay, setNavBarDisplay] = useLocalStorage<
        ValueOf<typeof NavBarDisplayMode>
    >(NAVBAR_DISPLAY_KEY, NavBarDisplayMode.Open)
    const isFrozenRef = useRef(false)
    const [setTimeout, clearTimeout] = useTimeout()

    const logSegmentToggleEvent = useCallback((visible: boolean) => {
        logEvent(SegmentEvent.NavigationPanelVisibilityStateToggled, {
            visible,
        })
    }, [])

    const onNavBarShortCutToggle = useCallback(() => {
        if (navBarDisplay === NavBarDisplayMode.Open) {
            setNavBarDisplay(NavBarDisplayMode.Collapsed)
            logSegmentToggleEvent(false)
        } else {
            setNavBarDisplay(NavBarDisplayMode.Open)
            logSegmentToggleEvent(true)
        }
    }, [navBarDisplay, setNavBarDisplay, logSegmentToggleEvent])

    const onMenuToggle = useCallback(() => {
        if (navBarDisplay === NavBarDisplayMode.Open) {
            // Freeze the navbar to prevent it from being shown when the user hovers the global nav
            // after the toggle menu button is clicked to hide the navbar
            isFrozenRef.current = true
            setNavBarDisplay(NavBarDisplayMode.Collapsed)
            setIsNavHovered(false)
            clearTimeout()
            setTimeout(() => {
                isFrozenRef.current = false
            }, FREEZE_TIMEOUT)
            logSegmentToggleEvent(false)
        } else {
            setNavBarDisplay(NavBarDisplayMode.Open)
            logSegmentToggleEvent(true)
        }
    }, [
        navBarDisplay,
        setNavBarDisplay,
        clearTimeout,
        setTimeout,
        logSegmentToggleEvent,
    ])

    // Used for both the global nav and the collapsible navbar mouse hover events
    const onNavHover = useCallback(() => {
        // If the navbar is freezed, don't allow the hover event to happen
        if (isFrozenRef.current) {
            return
        }
        setIsNavHovered(true)
        if (navBarDisplay === NavBarDisplayMode.Collapsed) {
            setNavBarDisplay(NavBarDisplayMode.Hover)
        }
    }, [navBarDisplay, setNavBarDisplay])

    // Used for the both global nav and the collapsible navbar mouse leave events
    const onNavLeave = useCallback(() => {
        // If the navbar is still freezed when the user
        // leaves the navbar, we reset the freezed state to ensure consistency
        /* istanbul ignore next if */
        if (isFrozenRef.current) {
            isFrozenRef.current = false
        }
        setIsNavHovered(false)
    }, [])

    const onOverlayHover = useCallback(() => {
        onNavLeave()
        if (navBarDisplay === NavBarDisplayMode.Hover) {
            setNavBarDisplay(NavBarDisplayMode.Collapsed)
        }
    }, [navBarDisplay, onNavLeave, setNavBarDisplay])

    const value = useMemo(
        () => ({
            navBarDisplay,
            setNavBarDisplay,
            isNavHovered,
            onNavHover,
            onNavLeave,
            onOverlayHover,
            onMenuToggle,
            onNavBarShortCutToggle,
            isNavBarVisible: navBarDisplay !== NavBarDisplayMode.Collapsed,
        }),
        [
            navBarDisplay,
            setNavBarDisplay,
            isNavHovered,
            onNavHover,
            onNavLeave,
            onOverlayHover,
            onMenuToggle,
            onNavBarShortCutToggle,
        ],
    )

    return (
        <NavBarContext.Provider value={value}>
            {children}
        </NavBarContext.Provider>
    )
}
