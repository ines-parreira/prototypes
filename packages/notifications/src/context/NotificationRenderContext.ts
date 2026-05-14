import { createContext, useContext } from 'react'

interface NotificationRenderContextValue {
    isListItem: boolean
}

export const NotificationRenderContext =
    createContext<NotificationRenderContextValue>({
        isListItem: false,
    })

export function useNotificationRenderContext() {
    return useContext(NotificationRenderContext)
}
