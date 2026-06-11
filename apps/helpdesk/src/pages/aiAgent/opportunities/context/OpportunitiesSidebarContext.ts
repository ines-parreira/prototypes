import { createContext } from 'react'

export type OpportunitiesSidebarContextType = {
    isSidebarVisible: boolean
    setIsSidebarVisible: (value: boolean) => void
} | null

const DefaultExportOpportunitiesSidebarContext =
    createContext<OpportunitiesSidebarContextType>(null)

export { DefaultExportOpportunitiesSidebarContext }
