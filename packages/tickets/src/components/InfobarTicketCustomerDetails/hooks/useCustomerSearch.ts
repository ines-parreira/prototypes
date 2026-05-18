import { useCallback, useEffect, useRef, useState } from 'react'

import { useDebouncedValue, useUpdateEffect } from '@repo/hooks'
import type { SearchEngine } from '@repo/logging'
import {
    EntityType,
    logEvent,
    SearchRankSource,
    SegmentEvent,
    useSearchRankScenario,
} from '@repo/logging'

import { useSearchCustomers } from '@gorgias/helpdesk-queries'
import type { CustomerHighlightDataItem } from '@gorgias/helpdesk-types'

const SEARCH_ENGINE_HEADER = 'x-gorgias-search-engine'

export function useCustomerSearch() {
    const [searchTerm, setSearchTerm] = useState('')
    const trimmedSearchTerm = searchTerm.trim()
    const debouncedSearchTerm = useDebouncedValue(searchTerm, 300)
    const isSearchMode = debouncedSearchTerm.length > 0
    const {
        endScenario,
        registerResultsRequest,
        registerResultsResponse,
        registerResultSelection,
    } = useSearchRankScenario(SearchRankSource.CustomerProfile)
    // ref to prevent late requests from registering
    const hasPendingSearchRankRequestRef = useRef(false)

    const resetTrackedSearch = useCallback(() => {
        hasPendingSearchRankRequestRef.current = false
        endScenario()
    }, [endScenario])

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

    // end any active scenario as soon as the user fully clears the search.
    useUpdateEffect(() => {
        if (trimmedSearchTerm.length !== 0) {
            return
        }

        resetTrackedSearch()
    }, [resetTrackedSearch, trimmedSearchTerm])

    useEffect(() => {
        if (!isSearchMode) {
            return
        }

        // generic Segment event
        logEvent(SegmentEvent.InfobarSearchUsed, {
            account_domain: window.GORGIAS_STATE.currentAccount.domain,
            user_id: window.GORGIAS_STATE.currentUser?.id,
            timestamp: Date.now(),
        })
        // end previous scenario on new search term
        endScenario()
        registerResultsRequest({
            query: debouncedSearchTerm,
            requestTime: Date.now(),
        })
        hasPendingSearchRankRequestRef.current = true
    }, [debouncedSearchTerm, isSearchMode, registerResultsRequest, endScenario])

    useEffect(() => {
        if (!hasPendingSearchRankRequestRef.current || isLoading) {
            return
        }

        if (isError) {
            registerResultsResponse({
                responseTime: Date.now(),
                numberOfResults: 0,
                searchEngine: undefined,
            })
            hasPendingSearchRankRequestRef.current = false
            return
        }

        if (!data) {
            return
        }

        registerResultsResponse({
            responseTime: Date.now(),
            numberOfResults: data.data.data?.length ?? 0,
            searchEngine: data.headers?.[SEARCH_ENGINE_HEADER] as
                | SearchEngine
                | undefined,
        })
        hasPendingSearchRankRequestRef.current = false
    }, [data, isError, isLoading, registerResultsResponse])

    const highlightedSearchResults =
        (data?.data?.data as CustomerHighlightDataItem[]) ?? []

    const clearSearch = useCallback(() => {
        resetTrackedSearch()
        setSearchTerm('')
    }, [resetTrackedSearch])

    const registerSearchRankResultSelection = useCallback(
        (customerId: number, index: number) => {
            registerResultSelection({
                id: customerId,
                index,
                type: EntityType.Customer,
            })
        },
        [registerResultSelection],
    )

    return {
        searchTerm,
        setSearchTerm,
        clearSearch,
        registerResultSelection: registerSearchRankResultSelection,
        isSearchMode,
        searchResults: highlightedSearchResults,
        isSearching: isLoading && isSearchMode,
        searchError: isError ? error : null,
    }
}
