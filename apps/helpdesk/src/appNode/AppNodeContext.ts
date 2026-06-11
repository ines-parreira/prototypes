import { createContext } from 'react'

export type AppNodeContextType = HTMLDivElement | null

const DefaultExportAppNodeContext = createContext<AppNodeContextType>(null)

export { DefaultExportAppNodeContext }
