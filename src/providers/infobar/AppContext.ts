import {createContext} from 'react'

export type AppContextType = {
    appId: string | null
}

export const AppContext = createContext<AppContextType>({
    appId: null,
})
