import { createContext } from 'react'

/**
 * Temporary enum to match the legacy application code
 * Remove this once the notification types (and potentially implementation) are
 * packaged up and shareable across the monorepo
 */
export enum NotificationStatus {
    Success = 'success',
    Error = 'error',
    Warning = 'warning',
    Info = 'info',
}

export type AgentStatusLegacyBridgeContextType = {
    dispatchNotification: (params: {
        id?: string
        status: NotificationStatus
        message: string
        dismissAfter?: number
    }) => void
}

export const AgentStatusLegacyBridgeContext = createContext<
    AgentStatusLegacyBridgeContextType | undefined
>(undefined)
