import { LegacyBridgeContext, LegacyBridgeContextType } from './context'

type TicketsLegacyBridgeProviderProps = Partial<LegacyBridgeContextType> & {
    children: React.ReactNode
    dispatchNotification: LegacyBridgeContextType['dispatchNotification']
}
/**
 * This component is used to provide a bridge between the legacy application code in the apps/helpdesk
 * and the new application code in the packages/tickets.
 */
export const TicketsLegacyBridgeProvider = ({
    children,
    dispatchNotification,
}: TicketsLegacyBridgeProviderProps) => {
    return (
        <LegacyBridgeContext.Provider value={{ dispatchNotification }}>
            {children}
        </LegacyBridgeContext.Provider>
    )
}
