import { createContext } from 'react'

export type LegacyBridgeContextType = {
    placeholderStoreUpdateFn: () => void
}

export const LegacyBridgeContext =
    createContext<LegacyBridgeContextType | null>(null)
