import React, {HTMLProps, useContext} from 'react'

import {ScreensContext} from './Screens'

type Props = {
    name: string
} & HTMLProps<HTMLDivElement>

const Screen = ({children, name, ...props}: Props) => {
    const screensContext = useContext(ScreensContext)

    if (screensContext == null) {
        throw new Error('Screen must be used within a ScreensContext.Provider')
    }

    return screensContext.activeScreen === name ? (
        <div {...props}>{children}</div>
    ) : null
}

export default Screen
