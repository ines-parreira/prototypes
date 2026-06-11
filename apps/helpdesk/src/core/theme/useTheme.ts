import { useContext } from 'react'

import { DefaultExportThemeContext as ThemeContext } from './ThemeContext'

export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (ctx === null) {
        throw new Error('`useTheme` may not be used outside of a ThemeProvider')
    }

    return ctx.theme
}
