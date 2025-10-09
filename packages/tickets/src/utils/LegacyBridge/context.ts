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
    Loading = 'loading',
}

export type LegacyBridgeContextType = {
    dispatchNotification: ({
        status,
        message,
    }: {
        status: NotificationStatus
        message: string
    }) => void
}

export const LegacyBridgeContext =
    createContext<LegacyBridgeContextType | null>(null)
