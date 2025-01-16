import {THEME_NAME} from '@gorgias/design-tokens'
import {useEffect} from 'react'

import useLocalStorage from 'hooks/useLocalStorage'

import type {HelpdeskThemeName} from './types'

const themeValues = [...Object.values(THEME_NAME), 'system']

export default function useActualTheme() {
    const [theme, setTheme] = useLocalStorage<HelpdeskThemeName>(
        'theme',
        THEME_NAME.Classic
    )

    // Properly sanitize the value from localstorage, since it can
    // technically be anything as it's in the user's cintrol
    const actualTheme = !themeValues.includes(theme)
        ? THEME_NAME.Classic
        : theme

    useEffect(() => {
        if (actualTheme !== theme) {
            setTheme(actualTheme)
        }
    }, [actualTheme, setTheme, theme])

    return [actualTheme, setTheme] as const
}
