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
    filter: string
    setFilter: React.Dispatch<React.SetStateAction<string>>
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
    const [filter, setFilter] = useState('')

    const filteredStores = useMemo(() => {
        if (!filter) return stores
        return stores.filter((store) =>
            store.store.name.toLowerCase().includes(filter.toLowerCase()),
        )
    }, [stores, filter])

    const paginatedStores = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE
        return filteredStores.slice(startIndex, startIndex + PAGE_SIZE)
    }, [filteredStores, currentPage])

    const totalPages = Math.ceil(filteredStores.length / PAGE_SIZE)
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
                filter,
                setFilter,
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
