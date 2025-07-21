import type { ComponentType } from 'react'

import type { SetTheme, Theme } from './types'
import useSetTheme from './useSetTheme'
import useTheme from './useTheme'

export type WithThemeProps = {
    setTheme: SetTheme
    theme: Theme
}

export default function withTheme<T extends object>(
    Component: ComponentType<T & WithThemeProps>,
) {
    return (props: T) => {
        const setTheme = useSetTheme()
        const theme = useTheme()

        return <Component {...props} setTheme={setTheme} theme={theme} />
    }
}
