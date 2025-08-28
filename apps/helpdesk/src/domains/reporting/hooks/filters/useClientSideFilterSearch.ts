import { useCallback, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useDebouncedValue } from '@repo/hooks'
import noop from 'lodash/noop'

import { useFlag } from 'core/flags'
import { FilterOptionGroup } from 'domains/reporting/pages/types'

function filterOptionsByQuery(
    filterOptionGroups: FilterOptionGroup[],
    query: string,
) {
    const lowerCaseQuery = query.toLowerCase()

    return filterOptionGroups.map((filterOptionGroup) => ({
        ...filterOptionGroup,
        options: filterOptionGroup.options.filter((option) =>
            option.label.toLowerCase().includes(lowerCaseQuery),
        ),
    }))
}

function useIsClientSideFilterSearchDisabled() {
    const isFeatureFlagEnabled = useFlag(
        FeatureFlagKey.ReportingImprovementFilterSearch,
    )

    return !isFeatureFlagEnabled
}

export type ClientSideFilterSearch = {
    value: string | undefined
    result: FilterOptionGroup[]
    onSearch: (value: string) => void
    onClear: () => void
}

export function useClientSideFilterSearch(
    filterOptionGroups: FilterOptionGroup[],
    initialValue = '',
): ClientSideFilterSearch {
    const isClientSideFilterSearchDisabled =
        useIsClientSideFilterSearchDisabled()

    const [query, setQuery] = useState(initialValue)
    const debouncedQuery = useDebouncedValue(query, 250)

    const filteredGroups = filterOptionsByQuery(
        filterOptionGroups,
        debouncedQuery,
    )

    const onClear = useCallback(() => setQuery(''), [])

    if (isClientSideFilterSearchDisabled) {
        return {
            value: undefined,
            result: filterOptionGroups,
            onSearch: noop,
            onClear: noop,
        }
    }

    return {
        value: query,
        result: filteredGroups,
        onSearch: setQuery,
        onClear,
    }
}
