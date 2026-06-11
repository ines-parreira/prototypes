import { useContext } from 'react'

import { DefaultExportOverlayContext as OverlayContext } from '../OverlayContext'

export function useNotificationsOverlay() {
    const ctx = useContext(OverlayContext)
    if (!ctx) {
        throw new Error(
            '`useNotificationsOverlay may only be used with a NotificationsProvider',
        )
    }

    return ctx
}
