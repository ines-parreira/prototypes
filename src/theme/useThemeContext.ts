import {THEME_NAME, themeTokenMap} from '@gorgias/design-tokens'
import {useMemo} from 'react'

import useActualTheme from './useActualTheme'

export default function useThemeContext() {
    const [theme, setTheme] = useActualTheme()

    const prefersDarkTheme = window.matchMedia(
        '(prefers-color-scheme: dark)'
    ).matches

    const resolvedTheme =
        theme === 'system'
            ? prefersDarkTheme
                ? THEME_NAME.Dark
                : THEME_NAME.Light
            : theme

    return useMemo(
        () => ({
            setTheme: setTheme,
            theme: {
                name: theme,
                resolvedName: resolvedTheme,
                tokens: themeTokenMap[resolvedTheme],
            },
        }),
        [resolvedTheme, theme, setTheme]
    )
}
