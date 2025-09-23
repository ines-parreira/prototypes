import { useAIAgentLegacyBridge } from './utils/LegacyBridge/useAIAgentLegacyBridge'

export const Placeholder = () => {
    const context = useAIAgentLegacyBridge()
    context.placeholderStoreUpdateFn()
    return <div>Placeholder</div>
}
