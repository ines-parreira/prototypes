import React, {ComponentProps, ComponentType} from 'react'

import useSavedTheme from './useSavedTheme'
import useSetTheme from './useSetTheme'
import useTheme from './useTheme'

export const withTheme = (Component: ComponentType<any>) => {
    return (props: ComponentProps<typeof Component>) => {
        const theme = useTheme()
        const savedTheme = useSavedTheme()
        const setTheme = useSetTheme()

        return (
            <Component
                {...props}
                theme={theme}
                savedTheme={savedTheme}
                setTheme={setTheme}
            />
        )
    }
}

export default withTheme
