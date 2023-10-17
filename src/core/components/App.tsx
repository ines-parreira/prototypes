import React, {ReactNode} from 'react'

import {AppNode} from 'appNode'
import {useTheme} from 'theme'

type Props = {
    children: ReactNode
}

export default function App({children}: Props) {
    const theme = useTheme()

    return <AppNode className={theme}>{children}</AppNode>
}
