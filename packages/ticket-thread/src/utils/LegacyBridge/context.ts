import { createContext } from 'react'

import type { LegacyBridgeContextType } from './types'

export const LegacyBridgeContext =
    createContext<LegacyBridgeContextType | null>(null)
