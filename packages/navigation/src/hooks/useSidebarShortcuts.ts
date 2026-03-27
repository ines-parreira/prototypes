import { useMemo } from 'react'

import { useShortcuts } from '@repo/utils'

import { useSidebar } from '../contexts/SidebarContext'

export const useSidebarShortcuts = () => {
    const { onSidebarShortcutToggle } = useSidebar()
    const actions = useMemo(
        () => ({
            TOGGLE_NAVBAR: {
                action: onSidebarShortcutToggle,
            },
        }),
        [onSidebarShortcutToggle],
    )

    return useShortcuts('App', actions)
}
