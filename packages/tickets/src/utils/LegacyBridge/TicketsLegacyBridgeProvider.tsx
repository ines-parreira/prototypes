import { LegacyBridgeContext, LegacyBridgeContextType } from './context'

type TicketsLegacyBridgeProviderProps = LegacyBridgeContextType & {
    children: React.ReactNode
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
