import {createContext} from 'react'

export const NavBarDisplayMode = {
    /**
     * When the user hovers over the GlobalNavigation and the Navbar is not open
     */
    Hover: 'hover',
    /**
     * When the user click the GlobalNavigation Menu button,
     * Also is the default state
     */
    Open: 'open',
    /**
     * When the NavBar is not visible
     */
    Collapsed: 'collapsed',
} as const

export type NavBarContextType = {
    navBarDisplay: ValueOf<typeof NavBarDisplayMode>
    setNavBarDisplay: (value: ValueOf<typeof NavBarDisplayMode>) => void
    isNavHovered: boolean
    onNavHover: () => void
    onNavLeave: () => void
    onOverlayHover: () => void
    onMenuToggle: () => void
    isNavBarVisible: boolean
    onHomeButtonClick: () => void
}

export const NavBarContext = createContext<NavBarContextType | undefined>(
    undefined
)
