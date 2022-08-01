import React, {createContext, useMemo, ReactNode} from 'react'

type Props = {
    activeScreen?: string
    children: ReactNode
}

type ScreensContextState = Pick<Props, 'activeScreen'>

export const ScreensContext = createContext<ScreensContextState | null>(null)

const Screens = ({activeScreen, children}: Props) => {
    const contextValue = useMemo<ScreensContextState>(() => {
        return {
            activeScreen,
        }
    }, [activeScreen])

    return (
        <ScreensContext.Provider value={contextValue}>
            {children}
        </ScreensContext.Provider>
    )
}

export default Screens
