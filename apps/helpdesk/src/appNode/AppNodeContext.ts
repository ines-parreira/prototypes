import { createContext } from 'react'

export type AppNodeContextType = HTMLDivElement | null

export default createContext<AppNodeContextType>(null)
