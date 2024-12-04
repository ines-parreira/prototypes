import {useEffect, useMemo} from 'react'

import {usePersistedState} from 'common/hooks'

import {THEMES, THEME_TYPES} from './constants'
import {ThemeType} from './types'

export const themeValues = Object.values(THEME_TYPES)

export default function useThemeContext() {
    const [savedTheme, setSavedTheme] = usePersistedState<ThemeType>(
        'theme',
        THEME_TYPES.Modern
    )
    const prefersDarkTheme = window.matchMedia(
        '(prefers-color-scheme: dark)'
    ).matches

    // Properly sanitize the value from localstorage, since it can
    // technically be anything as it's in the user's cintrol
    const actualTheme = themeValues.includes(savedTheme)
        ? savedTheme
        : THEME_TYPES.Modern
    useEffect(() => {
        if (actualTheme !== savedTheme) {
            setSavedTheme(actualTheme)
        }
    }, [actualTheme, savedTheme, setSavedTheme])

    const theme = useMemo(
        () =>
            actualTheme === THEME_TYPES.System
                ? prefersDarkTheme
                    ? THEME_TYPES.Dark
                    : THEME_TYPES.Light
                : actualTheme,
        [prefersDarkTheme, actualTheme]
    )

    const context = useMemo(
        () => ({
            savedTheme: actualTheme,
            theme,
            setTheme: setSavedTheme,
            colorTokens: THEMES[theme].colorTokens,
        }),
        [actualTheme, setSavedTheme, theme]
    )

    return context
}
