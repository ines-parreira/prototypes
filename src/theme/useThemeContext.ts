import {useEffect, useMemo} from 'react'

import {usePersistedState} from 'common/hooks'
import {tryLocalStorage} from 'services/common/utils'

import {Theme, ThemeValue} from './types'

export default function useThemeContext() {
    const [savedTheme, setSavedTheme] = usePersistedState<Theme | 'modern'>(
        'theme',
        'modern light'
    )
    const prefersDarkTheme = window.matchMedia(
        '(prefers-color-scheme: dark)'
    ).matches

    // Deprecates 'modern' as theme value on local storage
    // if only 'modern' is set as theme, accessory tokens are not available for modern theme
    useEffect(() => {
        if (savedTheme === 'modern') {
            tryLocalStorage(() => {
                localStorage.setItem('theme', JSON.stringify('modern light'))
                setSavedTheme('modern light')
            })
        }
    }, [savedTheme, setSavedTheme])

    const theme: ThemeValue = useMemo(
        () =>
            savedTheme === 'system'
                ? prefersDarkTheme
                    ? 'dark'
                    : 'light'
                : savedTheme === 'modern'
                ? 'modern light'
                : savedTheme,
        [prefersDarkTheme, savedTheme]
    )

    return {
        savedTheme,
        theme,
        setTheme: setSavedTheme,
    } as const
}
