import {createContext} from 'react'

export type CanduContextType = boolean | null

export default createContext<CanduContextType>(null)
