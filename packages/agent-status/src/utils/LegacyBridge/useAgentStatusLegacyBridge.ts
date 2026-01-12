import { useContext } from 'react'

import { AgentStatusLegacyBridgeContext } from './context'

export function useAgentStatusLegacyBridge() {
    const context = useContext(AgentStatusLegacyBridgeContext)
    if (!context) {
        throw new Error(
            'useAgentStatusLegacyBridge must be used within AgentStatusLegacyBridgeProvider',
        )
    }
    return context
}
