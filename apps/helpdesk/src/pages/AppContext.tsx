import type { ReactNode } from 'react'
import type React from 'react'
import { createContext, useCallback, useContext, useRef, useState } from 'react'

import { createPortal } from 'react-dom'

type CollapsibleColumnWidthConfig = {
    width?: string
    maxWidth?: string
    minWidth?: string
}

interface AppContextType {
    collapsibleColumnChildren: ReactNode | null
    setCollapsibleColumnChildren: (children: ReactNode | null) => void
    isCollapsibleColumnOpen: boolean
    setIsCollapsibleColumnOpen: (isOpen: boolean) => void
    collapsibleColumnWidthConfig: CollapsibleColumnWidthConfig | undefined
    setCollapsibleColumnWidthConfig: (
        config: CollapsibleColumnWidthConfig | undefined,
    ) => void
    collapsibleColumnRef: React.RefObject<HTMLDivElement>
    warpToCollapsibleColumn: (component: ReactNode) => React.ReactPortal | null
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const useAppContext = () => {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useAppContext must be used within AppContextProvider')
    }
    return context
}

interface AppContextProviderProps {
    children: ReactNode
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({
    children,
}) => {
    const [collapsibleColumnChildren, setCollapsibleColumnChildren] =
        useState<ReactNode | null>(null)
    const [isCollapsibleColumnOpen, setIsCollapsibleColumnOpen] =
        useState(false)
    const [collapsibleColumnWidthConfig, setCollapsibleColumnWidthConfig] =
        useState<CollapsibleColumnWidthConfig | undefined>(undefined)

    // used to portal components into the collapsible column
    const collapsibleColumnRef = useRef<HTMLDivElement>(null)

    const warpToCollapsibleColumn = useCallback(
        (component: ReactNode) => {
            if (!collapsibleColumnRef.current) {
                return null
            }
            return createPortal(component, collapsibleColumnRef.current)
        },
        [collapsibleColumnRef],
    )

    const value: AppContextType = {
        collapsibleColumnChildren,
        setCollapsibleColumnChildren,
        isCollapsibleColumnOpen,
        setIsCollapsibleColumnOpen,
        collapsibleColumnWidthConfig,
        setCollapsibleColumnWidthConfig,
        collapsibleColumnRef,
        warpToCollapsibleColumn,
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
