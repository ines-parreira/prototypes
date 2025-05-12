import React, { ReactNode, useMemo, useState } from 'react'

import useSafeContext from 'hooks/useSafeContext'

import { storeMappingFixture } from './fixtures'
import { Store } from './types'

type StoreManagementContextType = {
    stores: Store[]
    setStores: React.Dispatch<React.SetStateAction<Store[]>>
    paginatedStores: Store[]
    currentPage: number
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>
    totalPages: number
}

const StoreManagementContext = React.createContext<
    StoreManagementContextType | undefined
>(undefined)
StoreManagementContext.displayName = 'StoreManagementContext'

export const PAGE_SIZE = 10

export function StoreManagementProvider({ children }: { children: ReactNode }) {
    const [stores, setStores] = useState<Store[]>(storeMappingFixture)

    const [currentPage, setCurrentPage] = useState(1)

    const paginatedStores = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE
        return stores.slice(startIndex, startIndex + PAGE_SIZE)
    }, [currentPage, stores])

    const totalPages = Math.ceil(stores.length / PAGE_SIZE)
    return (
        <StoreManagementContext.Provider
            value={{
                stores,
                setStores,
                paginatedStores,
                currentPage,
                setCurrentPage,
                totalPages,
            }}
        >
            {children}
        </StoreManagementContext.Provider>
    )
}

export function useStoreManagementState() {
    return useSafeContext(StoreManagementContext)
}
