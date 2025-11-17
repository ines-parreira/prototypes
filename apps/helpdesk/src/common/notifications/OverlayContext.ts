import { createContext } from 'react'

import type useNotificationsContext from './hooks/useNotificationsContext'

type ContextType = ReturnType<typeof useNotificationsContext>

export default createContext<ContextType | null>(null)
