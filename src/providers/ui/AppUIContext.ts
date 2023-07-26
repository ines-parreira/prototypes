import {createContext, RefObject} from 'react'
import _noop from 'lodash/noop'

export type Theme = 'classic' | 'modern' | 'light' | 'dark'

export type AppUIContextType = {
    theme: Theme
    appRef?: RefObject<HTMLDivElement>
    setTheme?: (theme: Theme) => void
}

export const AppUIContext = createContext<AppUIContextType>({
    theme: 'classic',
    setTheme: () => _noop,
})
