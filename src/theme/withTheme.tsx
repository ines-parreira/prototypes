import React, {ComponentType, useContext} from 'react'

import ThemeContext from './ThemeContext'
import useThemeContext from './useThemeContext'

export type ThemeProps = ReturnType<typeof useThemeContext>

export function withTheme<T>(Component: ComponentType<T & ThemeProps>) {
    return (props: T) => {
        const themeContext = useContext(ThemeContext)

        return <Component {...props} {...themeContext!} />
    }
}

export default withTheme
