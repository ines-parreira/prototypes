import type { ReactNode } from 'react'

import { ThemeProvider as UIKitThemeProvider } from '@gorgias/merchant-ui-kit'

import ThemeContext from './ThemeContext'
import useThemeContext from './useThemeContext'

type Props = {
    children?: ReactNode
}

export default function ThemeProvider({ children }: Props) {
    const ctx = useThemeContext()
    const iconSpriteUrl =
        document.getElementById('icons')?.getAttribute('data') ?? undefined

    return (
        <ThemeContext.Provider value={ctx}>
            <UIKitThemeProvider
                name={ctx.theme.resolvedName}
                iconSpriteUrl={iconSpriteUrl}
            >
                {children}
            </UIKitThemeProvider>
        </ThemeContext.Provider>
    )
}
