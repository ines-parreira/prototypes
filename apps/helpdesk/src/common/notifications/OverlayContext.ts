import { createContext } from 'react'

import type { useNotificationsContext } from './hooks/useNotificationsContext'

type ContextType = ReturnType<typeof useNotificationsContext>

const DefaultExportOverlayContext = createContext<ContextType | null>(null)

export { DefaultExportOverlayContext }
