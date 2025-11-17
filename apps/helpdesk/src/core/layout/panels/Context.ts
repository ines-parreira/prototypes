import { createContext } from 'react'

import type useContextValue from './hooks/useContextValue'

export type ContextValue = ReturnType<typeof useContextValue>

export default createContext<ContextValue | null>(null)
