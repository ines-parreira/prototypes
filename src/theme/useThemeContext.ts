import {useEffect, useMemo} from 'react'

import {usePersistedState} from 'common/hooks'
import {tryLocalStorage} from 'services/common/utils'

import {Theme} from './types'

export default function useThemeContext() {
    const [savedTheme, setSavedTheme] = usePersistedState<Theme | 'modern'>(
        'theme',
        Theme.Modern
    )
    const prefersDarkTheme = window.matchMedia(
        '(prefers-color-scheme: dark)'
    ).matches

    // Deprecates 'modern' as theme value on local storage
    // if only 'modern' is set as theme, accessory tokens are not available for modern theme
    useEffect(() => {
        if (savedTheme === 'modern') {
            tryLocalStorage(() => {
                localStorage.setItem('theme', JSON.stringify(Theme.Modern))
                setSavedTheme(Theme.Modern)
            })
        }
    }, [savedTheme, setSavedTheme])

    const theme = useMemo(
        () =>
            savedTheme === Theme.System
                ? prefersDarkTheme
                    ? Theme.Dark
                    : Theme.Light
                : savedTheme === 'modern'
                ? Theme.Modern
                : savedTheme,
        [prefersDarkTheme, savedTheme]
    )

    return {
        savedTheme: savedTheme as Theme,
        theme,
        setTheme: setSavedTheme,
    } as const
}
