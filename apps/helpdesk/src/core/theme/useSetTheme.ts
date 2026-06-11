import { useContext } from 'react'

import { DefaultExportThemeContext as ThemeContext } from './ThemeContext'

export function useSetTheme() {
    const ctx = useContext(ThemeContext)
    if (ctx === null) {
        throw new Error(
            '`useSetTheme` may not be used outside of a ThemeProvider',
        )
    }

    return ctx.setTheme
}
