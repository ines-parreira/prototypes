import {useContext} from 'react'

import ThemeContext from './ThemeContext'

export default function useTheme() {
    const ctx = useContext(ThemeContext)
    if (ctx === null) {
        throw new Error('`useTheme` may not be used outside of a ThemeProvider')
    }

    return ctx.theme
}
