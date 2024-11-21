import React, {ComponentType, useContext} from 'react'

import ThemeContext from './ThemeContext'
import {ThemeContextType} from './types'

export function withTheme<T>(Component: ComponentType<T & ThemeContextType>) {
    return (props: T) => {
        const themeContext = useContext(ThemeContext)

        return <Component {...props} {...themeContext!} />
    }
}

export default withTheme
