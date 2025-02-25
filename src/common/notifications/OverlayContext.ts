import { createContext } from 'react'

import useNotificationsContext from './hooks/useNotificationsContext'

type ContextType = ReturnType<typeof useNotificationsContext>

export default createContext<ContextType | null>(null)
