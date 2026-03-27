import { createContext, useCallback, useContext, useMemo } from 'react'

import { useLocalStorage } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'

export type SidebarContextValue = {
    isCollapsed: boolean
    toggleCollapse: () => void
    onSidebarShortcutToggle: () => void
}

export const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({
    children,
}: {
    children:
        | React.ReactNode
        | ((props: SidebarContextValue) => React.ReactNode)
}) {
    const [isCollapsed, setIsCollapsed] = useLocalStorage<boolean>(
        'navigation-sidebar-collapsed',
        false,
    )

    const toggleCollapse = useCallback(
        () => setIsCollapsed((prev) => !prev),
        [setIsCollapsed],
    )

    const onSidebarShortcutToggle = useCallback(() => {
        logEvent(SegmentEvent.NavigationPanelVisibilityStateToggled, {
            visible: !isCollapsed,
        })
        toggleCollapse()
    }, [isCollapsed, toggleCollapse])

    const value = useMemo(
        () => ({ isCollapsed, toggleCollapse, onSidebarShortcutToggle }),
        [isCollapsed, toggleCollapse, onSidebarShortcutToggle],
    )

    return (
        <SidebarContext.Provider value={value}>
            {typeof children === 'function' ? children(value) : children}
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (!context) {
        throw new Error('useSidebar must be used within SidebarProvider')
    }
    return context
}
