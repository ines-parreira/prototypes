import { useContext } from 'react'

import { LegacyBridgeContext } from './context'

export const useAIAgentLegacyBridge = () => {
    const legacyBridgeContext = useContext(LegacyBridgeContext)
    if (!legacyBridgeContext) {
        throw new Error(
            'useAIAgentLegacyBridge must be used within AIAgentLegacyBridgeProvider',
        )
    }
    return legacyBridgeContext
}
