import {createContext} from 'react'

import type {SetTheme, Theme} from './types'

type ThemeContextType = {
    setTheme: SetTheme
    theme: Theme
}

export default createContext<ThemeContextType | null>(null)
