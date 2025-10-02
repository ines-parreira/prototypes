import { LegacyBridgeContext } from './context'

type TicketsLegacyBridgeProviderProps = {
    children: React.ReactNode
    placeholderStoreUpdateFn: () => void
}
/**
 * This component is used to provide a bridge between the legacy application code in the apps/helpdesk
 * and the new application code in the packages/tickets.
 *
 */
export const TicketsLegacyBridgeProvider = ({
    children,
    placeholderStoreUpdateFn = () => 'placeholderStoreUpdateFn',
}: TicketsLegacyBridgeProviderProps) => {
    return (
        <LegacyBridgeContext.Provider value={{ placeholderStoreUpdateFn }}>
            {children}
        </LegacyBridgeContext.Provider>
    )
}
