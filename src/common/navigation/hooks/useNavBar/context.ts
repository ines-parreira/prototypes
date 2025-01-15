import {createContext} from 'react'

export const NavBarDisplayMode = {
    /**
     * When when the user hovers over the nav bar and global navigation
     */
    Hover: 'hover',
    /**
     * When the user click the nav bar Menu button, also the default state
     */
    Open: 'open',
    /**
     * When the NavBar is not visibile
     */
    Collapsed: 'collapsed',
} as const

export type NavBarContextType = {
    navBarDisplay: ValueOf<typeof NavBarDisplayMode>
    setNavBarDisplay: (value: ValueOf<typeof NavBarDisplayMode>) => void
    isGlobalNavHovered: boolean
    onGlobalNavHover: () => void
    onGlobalNavLeave: () => void
    onOverlayEnter: () => void
    onMenuToggle: () => void
    isNavBarVisible: boolean
}

export const NavBarContext = createContext<NavBarContextType | undefined>(
    undefined
)
