import {NavBarDisplayMode} from './useNavBar/context'
import {useNavBar} from './useNavBar/useNavBar'

export const NavBarMenuIcons = {
    DoubleLeft: 'keyboard_double_arrow_left',
    DoubleRight: 'keyboard_double_arrow_right',
    Menu: 'menu',
} as const

export function useNavBarMenuIcon() {
    const {isNavHovered, navBarDisplay} = useNavBar()

    switch (navBarDisplay) {
        case NavBarDisplayMode.Open:
            return NavBarMenuIcons.DoubleLeft
        case NavBarDisplayMode.Hover:
            return isNavHovered
                ? NavBarMenuIcons.DoubleRight
                : NavBarMenuIcons.Menu
        case NavBarDisplayMode.Collapsed:
            return isNavHovered
                ? NavBarMenuIcons.DoubleRight
                : NavBarMenuIcons.Menu
        default:
            return NavBarMenuIcons.Menu
    }
}
