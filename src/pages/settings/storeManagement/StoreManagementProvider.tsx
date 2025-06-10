import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useMemo,
    useState,
} from 'react'

import useSafeContext from 'hooks/useSafeContext'
import { Integration } from 'models/integration/types'

import useStoresWithMaps from './hooks/useStoresWithMaps'
import { StoreWithAssignedChannels } from './types'

type StoreManagementContextType = {
    stores: StoreWithAssignedChannels[]
    unassignedChannels: Integration[]
    refetchMapping: () => void
    refetchIntegrations: () => void
    paginatedStores: StoreWithAssignedChannels[]
    currentPage: number
    setCurrentPage: Dispatch<SetStateAction<number>>
    totalPages: number
    isLoading: boolean
}

const StoreManagementContext = createContext<
    StoreManagementContextType | undefined
>(undefined)
StoreManagementContext.displayName = 'StoreManagementContext'

export const PAGE_SIZE = 10

export function StoreManagementProvider({ children }: { children: ReactNode }) {
    const {
        enrichedStores: stores,
        unassignedChannels,
        refetchMapping,
        refetchIntegrations,
        isLoading,
    } = useStoresWithMaps()

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
                paginatedStores,
                currentPage,
                setCurrentPage,
                totalPages,
                unassignedChannels,
                refetchMapping,
                refetchIntegrations,
                isLoading,
            }}
        >
            {children}
        </StoreManagementContext.Provider>
    )
}

export function useStoreManagementState() {
    return useSafeContext(StoreManagementContext)
}
