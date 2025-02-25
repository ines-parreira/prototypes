import { useContext } from 'react'

import OverlayContext from '../OverlayContext'

export default function useNotificationsOverlay() {
    const ctx = useContext(OverlayContext)
    if (!ctx) {
        throw new Error(
            '`useNotificationsOverlay may only be used with a NotificationsProvider',
        )
    }

    return ctx
}
