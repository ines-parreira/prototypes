import { createContext, ReactNode, useMemo } from 'react'

export type WarningBannerContextType = {
    isBannerVisible: boolean
}

export const WarningBannerContext = createContext<WarningBannerContextType>({
    isBannerVisible: false,
})

export const WarningBannerProvider = ({
    isBannerVisible,
    children,
}: {
    isBannerVisible: boolean
    children: ReactNode
}) => {
    const value = useMemo(
        () => ({
            isBannerVisible,
        }),
        [isBannerVisible],
    )

    return (
        <WarningBannerContext.Provider value={value}>
            {children}
        </WarningBannerContext.Provider>
    )
}
