import { LegacyBridgeContext } from './context'

type AIAgentLegacyBridgeProviderProps = {
    children: React.ReactNode
    placeholderStoreUpdateFn: () => void
}
/**
 * This component is used to provide a bridge between the legacy application code in the apps/helpdesk
 * and the new application code in the packages/ai-agent.
 *
 */
export const AIAgentLegacyBridgeProvider = ({
    children,
    placeholderStoreUpdateFn = () => 'placeholderStoreUpdateFn',
}: AIAgentLegacyBridgeProviderProps) => {
    return (
        <LegacyBridgeContext.Provider value={{ placeholderStoreUpdateFn }}>
            {children}
        </LegacyBridgeContext.Provider>
    )
}
