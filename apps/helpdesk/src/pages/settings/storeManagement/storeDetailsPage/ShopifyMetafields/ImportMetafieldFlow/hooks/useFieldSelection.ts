import { useCallback, useMemo, useState } from 'react'

import type { Field } from '../../MetafieldsTable/types'
import type { MetafieldCategory } from '../../types'

type SelectionByCategory = Record<MetafieldCategory, Field[]>

const INITIAL_SELECTION: SelectionByCategory = {
    customer: [],
    order: [],
    draft_order: [],
}

export function useFieldSelection() {
    const [selectedFieldsByCategory, setSelectedFieldsByCategory] =
        useState<SelectionByCategory>(INITIAL_SELECTION)

    const updateSelection = useCallback(
        (category: MetafieldCategory, fields: Field[]) => {
            setSelectedFieldsByCategory((prev) => ({
                ...prev,
                [category]: fields,
            }))
        },
        [],
    )

    const getSelectionForCategory = (category: MetafieldCategory): Field[] => {
        return selectedFieldsByCategory[category]
    }

    const getSelectionCount = (category: MetafieldCategory): number => {
        return selectedFieldsByCategory[category].length
    }

    const allSelectedFields = useMemo((): Field[] => {
        return Object.values(selectedFieldsByCategory).flat()
    }, [selectedFieldsByCategory])

    const clearSelectionForCategory = useCallback(
        (category: MetafieldCategory) => {
            setSelectedFieldsByCategory((prev) => ({
                ...prev,
                [category]: [],
            }))
        },
        [],
    )

    const clearAllSelections = useCallback(() => {
        setSelectedFieldsByCategory(INITIAL_SELECTION)
    }, [])

    return {
        selectedFieldsByCategory,
        updateSelection,
        getSelectionForCategory,
        getSelectionCount,
        allSelectedFields,
        clearSelectionForCategory,
        clearAllSelections,
    }
}
