import React, { createContext, ReactNode, useContext, useState } from 'react'

interface AppContextType {
    collapsibleColumnChildren: ReactNode | null
    setCollapsibleColumnChildren: (children: ReactNode | null) => void
    isCollapsibleColumnOpen: boolean
    setIsCollapsibleColumnOpen: (isOpen: boolean) => void
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

    const value: AppContextType = {
        collapsibleColumnChildren,
        setCollapsibleColumnChildren,
        isCollapsibleColumnOpen,
        setIsCollapsibleColumnOpen,
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
