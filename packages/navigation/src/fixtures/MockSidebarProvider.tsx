import type { ReactNode } from 'react'

import { SidebarContext } from '../contexts/SidebarContext'
import type { SidebarContextValue } from '../contexts/SidebarContext'

export type MockSidebarProviderProps = Partial<SidebarContextValue> & {
    children: ReactNode
}

export function MockSidebarProvider({
    children,
    isCollapsed = false,
    toggleCollapse = () => {},
    onSidebarShortcutToggle = () => {},
}: MockSidebarProviderProps) {
    return (
        <SidebarContext.Provider
            value={{ isCollapsed, toggleCollapse, onSidebarShortcutToggle }}
        >
            {children}
        </SidebarContext.Provider>
    )
}
