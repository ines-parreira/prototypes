import { useCallback, useEffect, useMemo, useState } from 'react'

import { BACK_BUTTON_ID, CLEAR_BUTTON_ID } from '../constants'
import {
    buildTreeFromChoices,
    flattenTreeWithCaptions,
    getOptionsAtPath,
    getPathFromValue,
} from '../helpers/tree'
import type {
    BackButtonOption,
    ClearButtonOption,
    Option,
    TreeOption,
    TreeValue,
} from '../types'
import { OptionEnum } from '../types'

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
                option.label.toLowerCase().includes(searchTerm.toLowerCase()),
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

    const selectOptions = useMemo((): Option[] => {
        const result: Option[] = [...options]

        if (!isSearching) {
            if (currentPath.length > 0) {
                const backButton: BackButtonOption = {
                    type: OptionEnum.Back,
                    id: BACK_BUTTON_ID,
                    label: currentPath[currentPath.length - 1] || 'Back',
                }
                result.unshift(backButton)
            }

            if (!!selectedValue) {
                const clearButton: ClearButtonOption = {
                    type: OptionEnum.Clear,
                    id: CLEAR_BUTTON_ID,
                    label: 'Clear selection',
                }
                result.push(clearButton)
            }
        }

        return result
    }, [currentPath, isSearching, options, selectedValue])

    const selectedOption = useMemo(() => {
        return options.find((opt) => opt.value === selectedValue)
    }, [options, selectedValue])

    return {
        selectOptions,
        selectedOption,
        goBack,
        goToLevel,
        resetPath,
    }
}
