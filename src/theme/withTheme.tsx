import React, {ComponentType, useContext} from 'react'

import ThemeContext from './ThemeContext'
import type {SetTheme, Theme} from './types'

export type WithThemeProps = {
    setTheme: SetTheme
    theme: Theme
}

export function withTheme<T>(Component: ComponentType<T & WithThemeProps>) {
    return (props: T) => {
        const themeContext = useContext(ThemeContext)

        return <Component {...props} {...themeContext!} />
    }
}

export default withTheme
