import {useMemo} from 'react'

import {usePersistedState} from 'common/hooks'
import {Theme} from './types'

export default function useThemeContext() {
    const [savedTheme, setSavedTheme] = usePersistedState<Theme>(
        'theme',
        'modern'
    )
    const prefersDarkTheme = window.matchMedia(
        '(prefers-color-scheme: dark)'
    ).matches

    const theme = useMemo(
        () =>
            savedTheme === 'system'
                ? prefersDarkTheme
                    ? 'dark'
                    : 'light'
                : savedTheme,
        [prefersDarkTheme, savedTheme]
    )

    return {
        savedTheme,
        theme,
        setTheme: setSavedTheme,
    }
}
