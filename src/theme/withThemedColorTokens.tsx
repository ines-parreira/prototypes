import React, {ComponentType, useContext} from 'react'
import ThemeContext from 'theme/ThemeContext'
import {ThemeColors} from 'theme/types'

export interface WithColorTokens {
    colorTokens?: ThemeColors
}

export function withThemedColorTokens<T>(
    WrappedComponent: ComponentType<T & WithColorTokens>
): ComponentType<T> {
    const displayName =
        WrappedComponent.displayName || WrappedComponent.name || 'Component'

    const ComponentWithThemedColorTokens = (props: T) => {
        const theme = useContext(ThemeContext)

        return <WrappedComponent {...props} colorTokens={theme?.colorTokens} />
    }
    ComponentWithThemedColorTokens.displayName = `withTheme(${displayName})`

    return ComponentWithThemedColorTokens
}
