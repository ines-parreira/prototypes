import { createContext } from 'react'

import type { SetTheme, Theme } from './types'

type ThemeContextType = {
    setTheme: SetTheme
    theme: Theme
}

const DefaultExportThemeContext = createContext<ThemeContextType | null>(null)

export { DefaultExportThemeContext }
