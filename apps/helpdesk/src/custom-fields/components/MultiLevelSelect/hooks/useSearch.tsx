import { useMemo, useState } from 'react'

import { getValueLabel } from 'custom-fields/helpers/getValueLabels'
import { CustomFieldValue } from 'custom-fields/types'

import { DROPDOWN_NESTING_FANCY_DELIMITER } from '../constants'
import { fromTreeKey } from '../helpers/buildTreeOfChoices'
import { getFullValueFromCurrentPath } from '../helpers/getFullValueFromCurrentPath'
import { ChoicesTree, SearchResults } from '../types'

export function useSearch({
    choices,
    dropdownValue,
    isDisabled,
}: {
    choices: ChoicesTree
    dropdownValue: CustomFieldValue | CustomFieldValue[] | undefined
    isDisabled: boolean
}) {
    const [search, setSearch] = useState('')

    const trimmedSearch = search.trim()

    const searchResults = useMemo(() => {
        const searchResults: SearchResults = []
        const currentPath: string[] = []

        if (!isDisabled && trimmedSearch.length) {
            searchChoices(trimmedSearch, choices, currentPath, searchResults)
        }
        return searchResults
    }, [trimmedSearch, choices, isDisabled])

    return {
        isSearching: isDisabled ? false : trimmedSearch.length > 0,
        search,
        setSearch,
        searchResults,
        valueIsInSearchResults: searchResults.some(({ value }) =>
            Array.isArray(dropdownValue)
                ? dropdownValue.includes(value)
                : value === dropdownValue,
        ),
    }
}

function searchChoices(
    search: string,
    currentChoices: ChoicesTree,
    currentPath: string[],
    searchResults: SearchResults,
    includeAllValues = false,
) {
    if (currentChoices.size === 0) {
        return
    }

    for (const [key, option] of currentChoices.entries()) {
        const keyWithoutMarker = fromTreeKey(key)
        if (
            typeof option.value === 'string' &&
            option.children.size === 0 &&
            (includeAllValues ||
                keyWithoutMarker.toLowerCase().includes(search.toLowerCase()))
        ) {
            searchResults.push({
                label: getValueLabel(option.value),
                path: currentPath
                    .map(fromTreeKey)
                    .join(DROPDOWN_NESTING_FANCY_DELIMITER),
                value: getFullValueFromCurrentPath(currentPath, option.value),
            })
        }
    }

    for (const [nextPath, nextChoices] of currentChoices.entries()) {
        searchChoices(
            search,
            nextChoices.children,
            [...currentPath, nextPath],
            searchResults,
            includeAllValues ||
                nextPath.toLowerCase().includes(search.toLowerCase()),
        )
    }
}
