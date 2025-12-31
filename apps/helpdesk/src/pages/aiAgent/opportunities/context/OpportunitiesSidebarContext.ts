import { createContext } from 'react'

export type OpportunitiesSidebarContextType = {
    isSidebarVisible: boolean
    setIsSidebarVisible: (value: boolean) => void
} | null

export default createContext<OpportunitiesSidebarContextType>(null)
