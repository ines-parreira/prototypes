import React, {ReactNode, useMemo, useState, useCallback} from 'react'

import useLocalStorage from 'hooks/useLocalStorage'

import {NavBarContext, NavBarDisplayMode} from '../hooks/useNavBar/context'

export const NAVBAR_DISPLAY_KEY = 'navbar-display'

export function NavBarProvider({children}: {children: ReactNode}) {
    const [isNavHovered, setisNavHovered] = useState(false)
    const [navBarDisplay, setNavBarDisplay] = useLocalStorage<
        ValueOf<typeof NavBarDisplayMode>
    >(NAVBAR_DISPLAY_KEY, NavBarDisplayMode.Open)

    const onMenuToggle = useCallback(() => {
        setNavBarDisplay((display) =>
            display === NavBarDisplayMode.Open
                ? NavBarDisplayMode.Collapsed
                : NavBarDisplayMode.Open
        )
    }, [setNavBarDisplay])

    // Used for both the global nav and the collapsible navbar mouse hover events
    const onNavHover = useCallback(() => {
        setisNavHovered(true)
        if (navBarDisplay === NavBarDisplayMode.Collapsed) {
            setNavBarDisplay(NavBarDisplayMode.Hover)
        }
    }, [navBarDisplay, setNavBarDisplay])

    // Used for the both global nav and the collapsible navbar mouse leave events
    const onNavLeave = useCallback(() => {
        setisNavHovered(false)
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
        ]
    )

    return (
        <NavBarContext.Provider value={value}>
            {children}
        </NavBarContext.Provider>
    )
}
