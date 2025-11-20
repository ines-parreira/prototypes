import type { LegacyBridgeContextType } from './context'
import { LegacyBridgeContext } from './context'

type TicketsLegacyBridgeProviderProps = LegacyBridgeContextType & {
    children: React.ReactNode
    ticketViewNavigation: LegacyBridgeContextType['ticketViewNavigation']
    dispatchDismissNotification: LegacyBridgeContextType['dispatchDismissNotification']
    dispatchNotification: LegacyBridgeContextType['dispatchNotification']
    dispatchAuditLogEvents: LegacyBridgeContextType['dispatchAuditLogEvents']
    dispatchHideAuditLogEvents: LegacyBridgeContextType['dispatchHideAuditLogEvents']
    toggleQuickReplies: LegacyBridgeContextType['toggleQuickReplies']
}
/**
 * This component is used to provide a bridge between the legacy application code in the apps/helpdesk
 * and the new application code in the packages/tickets.
 */
export const TicketsLegacyBridgeProvider = ({
    children,
    ...props
}: TicketsLegacyBridgeProviderProps) => {
    return (
        <LegacyBridgeContext.Provider value={props}>
            {children}
        </LegacyBridgeContext.Provider>
    )
}
