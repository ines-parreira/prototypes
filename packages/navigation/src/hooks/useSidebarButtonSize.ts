import {
    SIDEBAR_BUTTON_SIZE_COLLAPSED,
    SIDEBAR_BUTTON_SIZE_EXPANDED,
} from '../constants'
import { useSidebar } from '../contexts/SidebarContext'

export function useSidebarButtonSize() {
    const { isCollapsed } = useSidebar()
    return isCollapsed
        ? SIDEBAR_BUTTON_SIZE_COLLAPSED
        : SIDEBAR_BUTTON_SIZE_EXPANDED
}
