import { useEffect } from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { useLocalStorage } from '@gorgias/toolkit-react'

import { THEME_NAME } from '@gorgias/design-tokens'

import type { HelpdeskThemeName } from './types'

const themeValues = [...Object.values(THEME_NAME), 'system']

export default function useActualTheme() {
    const [theme, setTheme] = useLocalStorage<HelpdeskThemeName>(
        'theme',
        THEME_NAME.Light,
    )
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()

    // Properly sanitize the value from localstorage, since it can
    // technically be anything as it's in the user's control
    const sanitizedTheme = !themeValues.includes(theme)
        ? THEME_NAME.Light
        : theme
    const actualTheme =
        hasWayfindingMS1Flag && sanitizedTheme === THEME_NAME.Classic
            ? THEME_NAME.Light
            : sanitizedTheme

    useEffect(() => {
        if (
            actualTheme !== theme &&
            !(hasWayfindingMS1Flag && theme === THEME_NAME.Classic)
        ) {
            setTheme(actualTheme)
        }
    }, [actualTheme, setTheme, theme, hasWayfindingMS1Flag])

    return [actualTheme, setTheme] as const
}
