import { useMemo, useState } from 'react'

import {
    CHOICE_VALUES_SYMBOL,
    DROPDOWN_NESTING_FANCY_DELIMITER,
} from '../Deprecated_MultiLevelSelect/constants'
import { getFullValueFromCurrentPath } from '../Deprecated_MultiLevelSelect/helpers/getFullValueFromCurrentPath'
import { getLabel } from '../Deprecated_MultiLevelSelect/helpers/getLabel'
import type {
    ChoicesTree,
    SearchResults,
} from '../Deprecated_MultiLevelSelect/types'

export function useSearch({
    choices,
    dropdownValue,
    isDisabled,
}: {
    choices: ChoicesTree
    dropdownValue: string | undefined
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
        valueIsInSearchResults: searchResults.some(
            ({ value }) => value === dropdownValue,
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
