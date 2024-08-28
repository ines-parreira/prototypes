import React, {ReactElement} from 'react'

import ThemeContext from './ThemeContext'
import useThemeContext from './useThemeContext'

type Props = {
    children: ReactElement | ReactElement[]
}

export default function ThemeProvider({children}: Props) {
    const context = useThemeContext()

    return (
        <ThemeContext.Provider value={context}>
            {children}
        </ThemeContext.Provider>
    )
}
