import {useEffect, useMemo} from 'react'

import {usePersistedState} from 'common/hooks'

import {THEME_NAME, themeTokenMap} from './constants'
import {HelpdeskThemeName} from './types'

export const themeValues = Object.values(THEME_NAME)

export default function useThemeContext() {
    const [savedTheme, setSavedTheme] = usePersistedState<HelpdeskThemeName>(
        'theme',
        THEME_NAME.Classic
    )
    const prefersDarkTheme = window.matchMedia(
        '(prefers-color-scheme: dark)'
    ).matches

    // Properly sanitize the value from localstorage, since it can
    // technically be anything as it's in the user's cintrol
    const actualTheme = themeValues.includes(savedTheme)
        ? savedTheme
        : THEME_NAME.Classic
    useEffect(() => {
        if (actualTheme !== savedTheme) {
            setSavedTheme(actualTheme)
        }
    }, [actualTheme, savedTheme, setSavedTheme])

    const theme = useMemo(
        () =>
            actualTheme === THEME_NAME.System
                ? prefersDarkTheme
                    ? THEME_NAME.Dark
                    : THEME_NAME.Light
                : actualTheme,
        [prefersDarkTheme, actualTheme]
    )

    const context = useMemo(
        () => ({
            savedTheme: actualTheme,
            theme,
            setTheme: setSavedTheme,
            colorTokens: themeTokenMap[theme],
        }),
        [actualTheme, setSavedTheme, theme]
    )

    return context
}
