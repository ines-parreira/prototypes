import { useContext } from 'react'

import { LegacyBridgeContext } from './context'

export const useTicketsLegacyBridge = () => {
    const legacyBridgeContext = useContext(LegacyBridgeContext)
    if (!legacyBridgeContext) {
        throw new Error(
            'useTicketsLegacyBridge must be used within TicketsLegacyBridgeProvider',
        )
    }
    return legacyBridgeContext
}
