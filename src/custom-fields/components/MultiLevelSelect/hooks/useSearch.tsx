import { useMemo, useState } from 'react'

import { CustomFieldValue } from 'custom-fields/types'

import {
    CHOICE_VALUES_SYMBOL,
    DROPDOWN_NESTING_FANCY_DELIMITER,
} from '../constants'
import { getFullValueFromCurrentPath } from '../helpers/getFullValueFromCurrentPath'
import { getLabel } from '../helpers/getLabels'
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
    // leaves of the current branch
    for (const value of currentChoices[CHOICE_VALUES_SYMBOL]) {
        if (
            typeof value === 'string' &&
            (includeAllValues ||
                value.toLowerCase().includes(search.toLowerCase()))
        ) {
            searchResults.push({
                label: getLabel(value),
                path: currentPath.join(DROPDOWN_NESTING_FANCY_DELIMITER),
                value: getFullValueFromCurrentPath(currentPath, value),
            })
        }
    }

    // all other values are branches and not leaves
    for (const [nextPath, nextChoices] of Object.entries(currentChoices)) {
        searchChoices(
            search,
            nextChoices,
            [...currentPath, nextPath],
            searchResults,
            includeAllValues ||
                nextPath.toLowerCase().includes(search.toLowerCase()),
        )
    }
}
