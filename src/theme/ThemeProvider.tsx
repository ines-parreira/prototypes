import {ThemeContext as UIKitThemeContext} from '@gorgias/merchant-ui-kit'
import React, {ReactElement, useMemo} from 'react'

import ThemeContext from './ThemeContext'
import useThemeContext from './useThemeContext'

type Props = {
    children: ReactElement | ReactElement[]
}

export default function ThemeProvider({children}: Props) {
    const context = useThemeContext()

    const UIContext = useMemo(
        () => ({
            theme: context.theme,
            colorTokens: context.colorTokens,
        }),
        [context]
    )

    return (
        <ThemeContext.Provider value={context}>
            <UIKitThemeContext.Provider value={UIContext}>
                {children}
            </UIKitThemeContext.Provider>
        </ThemeContext.Provider>
    )
}
