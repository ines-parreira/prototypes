import { useContext } from 'react'

import { LegacyBridgeContext } from './context'

export const useTicketThreadLegacyBridge = () => {
    const legacyBridgeContext = useContext(LegacyBridgeContext)
    if (!legacyBridgeContext) {
        throw new Error(
            'useTicketThreadLegacyBridge must be used within TicketThreadLegacyBridgeProvider',
        )
    }
    return legacyBridgeContext
}
