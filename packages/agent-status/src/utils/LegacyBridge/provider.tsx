import type { ReactNode } from 'react'

import type { AgentStatusLegacyBridgeContextType } from './context'
import { AgentStatusLegacyBridgeContext } from './context'

export function AgentStatusLegacyBridgeProvider({
    children,
    ...bridgeFunctions
}: AgentStatusLegacyBridgeContextType & { children: ReactNode }) {
    return (
        <AgentStatusLegacyBridgeContext.Provider value={bridgeFunctions}>
            {children}
        </AgentStatusLegacyBridgeContext.Provider>
    )
}
