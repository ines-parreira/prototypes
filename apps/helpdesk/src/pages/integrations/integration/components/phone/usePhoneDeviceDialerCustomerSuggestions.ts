import type React from 'react'
import { useCallback, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import { debounce, isArray } from 'lodash'

import { useSearch } from '@gorgias/helpdesk-queries'
import { SearchType } from '@gorgias/helpdesk-types'

import type { UserSearchResult } from 'models/search/types'
import { isUserSearchResult } from 'models/search/types'

type UseCustomerSuggestionsArgs = {
    onEnter: () => void
    minSearchInputLength: number
    onCustomerSelect: (customer: UserSearchResult) => void
}

export function usePhoneDeviceDialerCustomerSuggestions({
    onEnter,
    minSearchInputLength,
    onCustomerSelect,
}: UseCustomerSuggestionsArgs) {
    const [query, setQuery] = useState('')

    const { isFetching: isSearchingCustomers, data } = useSearch(
        {
            type: SearchType.CustomerChannelPhone,
            query,
        },
        {
            query: {
                enabled: query.length >= minSearchInputLength,
                staleTime: Duration.seconds(30),
            },
        },
    )
    const [highlightedResultIndex, setHighlightedResultIndex] = useState<
        number | null
    >(null)

    const customers = isArray(data?.data.data)
        ? data?.data.data.filter(isUserSearchResult)
        : []

    const handleSelectCustomer = (customer: UserSearchResult) => {
        onCustomerSelect(customer)
        setHighlightedResultIndex(null)
    }

    const handleArrowKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        event.preventDefault()
        const resultsCount = customers.length
        let newIndex = highlightedResultIndex ?? -1

        if (event.key === 'ArrowUp') {
            newIndex = newIndex <= 0 ? resultsCount - 1 : newIndex - 1
        } else if (event.key === 'ArrowDown') {
            newIndex = newIndex >= resultsCount - 1 ? 0 : newIndex + 1
        }

        setHighlightedResultIndex(newIndex)
    }

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            event.stopPropagation()
            if (highlightedResultIndex !== null) {
                handleSelectCustomer(customers[highlightedResultIndex])
            } else {
                onEnter()
            }
        } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            handleArrowKeyDown(event)
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearchCustomers = useCallback(
        debounce(setQuery, Duration.millis(500)),
        [setQuery],
    )

    return {
        customers,
        isFetching: isSearchingCustomers,
        highlightedResultIndex,
        handleSelectCustomer,
        handleInputKeyDown,
        debouncedSearchCustomers,
    }
}
