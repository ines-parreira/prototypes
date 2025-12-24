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
        buttons,
        dismissAfter,
    }: {
        id?: string
        status: NotificationStatus
        message: string
        dismissAfter?: number
        buttons?: Array<{
            name: string
            primary?: boolean
            onClick?: (...args: unknown[]) => void
        }>
    }) => void
    dispatchDismissNotification: (id: string) => void
    ticketViewNavigation: {
        shouldDisplay: boolean
        shouldUseLegacyFunctions: boolean
        previousTicketId: number | undefined
        nextTicketId: number | undefined
        legacyGoToPrevTicket: () => Promise<void>
        isPreviousEnabled: boolean
        legacyGoToNextTicket: () => Promise<void>
        isNextEnabled: boolean
    }
    dispatchAuditLogEvents: () => void
    dispatchHideAuditLogEvents: () => void
    toggleQuickReplies: (toggle: boolean) => void
    onToggleUnread?: (ticketId: number, isUnread: boolean) => void
    handleTicketDraft: {
        hasDraft: boolean
        onResumeDraft: () => void
        onDiscardDraft: (params: {
            pathname: string
            search?: string
            state?: {
                receiver: {
                    name: string
                    address: string
                }
            }
        }) => void
    }
    makeOutboundCall: (options: {
        fromAddress: string
        toAddress: string
        integrationId: number
        customerName: string
        ticketId: number | null
        agentId: number
    }) => void
    voiceDevice: {
        device?: unknown
        call?: unknown
    }
}

export const LegacyBridgeContext =
    createContext<LegacyBridgeContextType | null>(null)
