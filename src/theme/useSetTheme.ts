import {useContext} from 'react'

import ThemeContext from './ThemeContext'

export default function useSetTheme() {
    const ctx = useContext(ThemeContext)
    if (ctx === null) {
        throw new Error(
            '`useSetTheme` may not be used outside of a ThemeProvider'
        )
    }

    return ctx[1]
}
