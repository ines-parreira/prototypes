import { useCallback } from 'react'

export function useAutoOpenSnoozeSubmenu() {
    return useCallback(() => {
        window.requestAnimationFrame(() => {
            // this selector-based submenu opening is fragile
            // we should see if selection is doable through an axiom interface
            const updateSnoozeMenuItem = document.querySelector<HTMLElement>(
                '[role="menu"][aria-label="Snooze ticket"] [role="menuitem"][data-key="update-snooze"]',
            )
            updateSnoozeMenuItem?.click()
        })
    }, [])
}
