import {ThemeProvider as UIKitThemeProvider} from '@gorgias/merchant-ui-kit'
import React from 'react'
import type {ReactNode} from 'react'

import ThemeContext from './ThemeContext'
import useThemeContext from './useThemeContext'

type Props = {
    children: ReactNode
}

export default function ThemeProvider({children}: Props) {
    const ctx = useThemeContext()

    return (
        <ThemeContext.Provider value={ctx}>
            <UIKitThemeProvider name={ctx.theme.resolvedName}>
                {children}
            </UIKitThemeProvider>
        </ThemeContext.Provider>
    )
}
