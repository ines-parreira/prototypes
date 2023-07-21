import {createContext} from 'react'
import _noop from 'lodash/noop'

export type Theme = 'classic' | 'modern' | 'light' | 'dark'

export type ThemeContextType = {
    theme: Theme
    setTheme?: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextType>({
    theme: 'classic',
    setTheme: () => _noop,
})
