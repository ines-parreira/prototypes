import { useEffect } from 'react'

import { THEME_NAME } from '@gorgias/design-tokens'

import useTheme from './useTheme'

const themeClassNames = Object.values(THEME_NAME)

export default function useApplyTheme() {
    const theme = useTheme()

    useEffect(() => {
        const actualTheme =
            theme.resolvedName === THEME_NAME.Classic
                ? THEME_NAME.Light
                : theme.resolvedName
        document.body.classList.remove(...themeClassNames)
        document.body.classList.add(actualTheme)
    }, [theme.resolvedName])
}
