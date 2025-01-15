import {THEME_NAME} from '@gorgias/design-tokens'
import {useEffect} from 'react'

import useTheme from './useTheme'

const themeClassNames = Object.values(THEME_NAME)

export default function useApplyTheme() {
    const theme = useTheme()

    useEffect(() => {
        document.body.classList.remove(...themeClassNames)
        document.body.classList.add(theme.resolvedName)
    }, [theme.resolvedName])
}
