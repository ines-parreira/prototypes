import { useCallback, useMemo, useState } from 'react'

import { useDebouncedValue } from '@repo/hooks'

import { useSearchCustomers } from '@gorgias/helpdesk-queries'
import type { CustomerHighlightDataItem } from '@gorgias/helpdesk-types'

export function useCustomerSearch() {
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearchTerm = useDebouncedValue(searchTerm, 300)
    const isSearchMode = debouncedSearchTerm.trim().length > 0

    const { data, isLoading, isError, error } = useSearchCustomers(
        {
            search: debouncedSearchTerm,
        },
        {
            with_highlights: true,
        },
        {
            query: {
                enabled: isSearchMode,
                staleTime: 60000 * 5,
            },
        },
    )

    const highlightedSearchResults = useMemo(() => {
        if (!data?.data?.data) {
            return []
        }

        return data.data.data as CustomerHighlightDataItem[]
    }, [data])

    const clearSearch = useCallback(() => {
        setSearchTerm('')
    }, [])

    return {
        searchTerm,
        setSearchTerm,
        clearSearch,
        isSearchMode,
        searchResults: highlightedSearchResults,
        isSearching: isLoading && isSearchMode,
        searchError: isError ? error : null,
    }
}
