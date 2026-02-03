import { useCallback, useEffect, useMemo, useState } from 'react'

import {
    buildTreeFromChoices,
    flattenTreeWithCaptions,
    getOptionsAtPath,
    getPathFromValue,
} from '../helpers/tree'
import type { NavigationState, TreeOption, TreeValue } from '../types'

type UseOptionsTreeParams = {
    choices: TreeValue[]
    selectedValue?: TreeValue
    searchTerm?: string
}

export function useOptionsTree({
    choices,
    selectedValue,
    searchTerm,
}: UseOptionsTreeParams) {
    const tree = useMemo(() => buildTreeFromChoices(choices), [choices])

    const initialPath = useMemo(() => {
        return getPathFromValue(selectedValue)
    }, [selectedValue])

    const [currentPath, setCurrentPath] = useState<string[]>(initialPath)

    useEffect(() => {
        setCurrentPath(initialPath)
    }, [initialPath])

    const isSearching = !!searchTerm

    const options = useMemo(() => {
        if (isSearching) {
            const flatOptions = flattenTreeWithCaptions(tree)
            return flatOptions.filter((option) =>
                option.path.some((pathItem) =>
                    pathItem.toLowerCase().includes(searchTerm.toLowerCase()),
                ),
            )
        }
        return getOptionsAtPath(tree, currentPath)
    }, [tree, currentPath, isSearching, searchTerm])

    const goBack = useCallback(() => {
        setCurrentPath((prev) => prev.slice(0, -1))
    }, [])

    const goToLevel = useCallback((option: TreeOption) => {
        if (option.hasChildren) {
            setCurrentPath(option.path)
        }
    }, [])

    const resetPath = useCallback(() => {
        setCurrentPath(initialPath)
    }, [initialPath])

    const navigationState = useMemo(
        (): NavigationState => ({
            canGoBack: currentPath.length > 0 && !isSearching,
            parentLevelName: currentPath[currentPath.length - 1] || null,
        }),
        [currentPath, isSearching],
    )

    const selectedOption = useMemo(() => {
        return options.find((opt) => opt.value === selectedValue)
    }, [options, selectedValue])

    return {
        selectOptions: options,
        selectedOption,
        goBack,
        goToLevel,
        resetPath,
        navigationState,
    }
}
