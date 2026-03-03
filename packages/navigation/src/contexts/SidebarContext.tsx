import { createContext, useContext } from 'react'

import { useLocalStorage } from '@repo/hooks'

type SidebarContextValue = {
    isCollapsed: boolean
    toggleCollapse: () => void
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

    const toggleCollapse = () => setIsCollapsed((prev) => !prev)

    const value = {
        isCollapsed,
        toggleCollapse,
    }

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
