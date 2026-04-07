import { createContext } from 'react'

export type LegacyBridgeContextType = {
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
    dtpToggle: {
        isEnabled: boolean
        setIsEnabled: (value: boolean) => void
        previousTicketId: number | undefined
        nextTicketId: number | undefined
        setPrevNextTicketIds: (ticketIds: {
            prev: number | undefined
            next: number | undefined
        }) => void
        shouldRedirectToSplitView: boolean
        setShouldRedirectToSplitView: (value: boolean) => void
    }
    dtpEnabled: {
        isEnabled: boolean
    }
    humanizeChannel: (channelIdentifier: string) => string
}

export const LegacyBridgeContext =
    createContext<LegacyBridgeContextType | null>(null)
