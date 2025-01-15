import React, {ReactNode, useMemo, useState, useCallback} from 'react'

import {NavBarContext, NavBarDisplayMode} from '../hooks/useNavBar/context'

export function NavBarProvider({children}: {children: ReactNode}) {
    const [isGlobalNavHovered, setIsGlobalNavHovered] = useState(false)
    const [navBarDisplay, setNavBarDisplay] = useState<
        ValueOf<typeof NavBarDisplayMode>
    >(NavBarDisplayMode.Open)

    const onMenuToggle = useCallback(() => {
        setNavBarDisplay((display) =>
            display === NavBarDisplayMode.Open
                ? NavBarDisplayMode.Collapsed
                : NavBarDisplayMode.Open
        )
    }, [])

    // Used for the global nav and the nav bar enter
    const onGlobalNavHover = useCallback(() => {
        setIsGlobalNavHovered(true)
        if (navBarDisplay === NavBarDisplayMode.Collapsed) {
            setNavBarDisplay(NavBarDisplayMode.Hover)
        }
    }, [navBarDisplay])

    const onGlobalNavLeave = useCallback(() => {
        setIsGlobalNavHovered(false)
    }, [])

    // Used for the global nav and the nav bar leave
    const onOverlayEnter = useCallback(() => {
        if (navBarDisplay === NavBarDisplayMode.Hover) {
            setNavBarDisplay(NavBarDisplayMode.Collapsed)
        }
    }, [navBarDisplay])

    const value = useMemo(
        () => ({
            navBarDisplay,
            setNavBarDisplay,
            isGlobalNavHovered,
            onGlobalNavHover,
            onGlobalNavLeave,
            onOverlayEnter,
            onMenuToggle,
            isNavBarVisible: navBarDisplay !== NavBarDisplayMode.Collapsed,
        }),
        [
            navBarDisplay,
            setNavBarDisplay,
            isGlobalNavHovered,
            onGlobalNavHover,
            onGlobalNavLeave,
            onOverlayEnter,
            onMenuToggle,
        ]
    )

    return (
        <NavBarContext.Provider value={value}>
            {children}
        </NavBarContext.Provider>
    )
}
