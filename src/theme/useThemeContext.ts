import {useEffect, useMemo} from 'react'

import {usePersistedState} from 'common/hooks'
import {tryLocalStorage} from 'services/common/utils'

import {THEMES, THEME_TYPES} from './constants'
import {ThemeType} from './types'

export default function useThemeContext() {
    const [savedTheme, setSavedTheme] = usePersistedState<ThemeType | 'modern'>(
        'theme',
        THEME_TYPES.Modern
    )
    const prefersDarkTheme = window.matchMedia(
        '(prefers-color-scheme: dark)'
    ).matches

    // Deprecates 'modern' as theme value on local storage
    // if only 'modern' is set as theme, accessory tokens are not available for modern theme
    useEffect(() => {
        if (savedTheme === 'modern') {
            tryLocalStorage(() => {
                localStorage.setItem(
                    'theme',
                    JSON.stringify(THEME_TYPES.Modern)
                )
                setSavedTheme(THEME_TYPES.Modern)
            })
        }
    }, [savedTheme, setSavedTheme])

    const theme = useMemo(
        () =>
            savedTheme === THEME_TYPES.System
                ? prefersDarkTheme
                    ? THEME_TYPES.Dark
                    : THEME_TYPES.Light
                : savedTheme === 'modern'
                  ? THEME_TYPES.Modern
                  : savedTheme,
        [prefersDarkTheme, savedTheme]
    )

    const context = useMemo(
        () => ({
            savedTheme: savedTheme as ThemeType,
            theme,
            setTheme: setSavedTheme,
            colorTokens: THEMES[theme].colorTokens,
        }),
        [savedTheme, setSavedTheme, theme]
    )

    return context
}
