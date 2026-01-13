import { useCallback, useMemo, useState } from 'react'

import type { Field } from '../../MetafieldsTable/types'
import type { SupportedCategories } from '../../types'

type SelectionByCategory = Record<SupportedCategories, Field[]>

const INITIAL_SELECTION: SelectionByCategory = {
    Customer: [],
    Order: [],
    DraftOrder: [],
}

export function useFieldSelection() {
    const [selectedFieldsByCategory, setSelectedFieldsByCategory] =
        useState<SelectionByCategory>(INITIAL_SELECTION)

    const updateSelection = useCallback(
        (category: SupportedCategories, fields: Field[]) => {
            setSelectedFieldsByCategory((prev) => ({
                ...prev,
                [category]: fields,
            }))
        },
        [],
    )

    const getSelectionForCategory = (
        category: SupportedCategories,
    ): Field[] => {
        return selectedFieldsByCategory[category]
    }

    const getSelectionCount = (category: SupportedCategories): number => {
        return selectedFieldsByCategory[category].length
    }

    const allSelectedFields = useMemo((): Field[] => {
        return Object.values(selectedFieldsByCategory).flat()
    }, [selectedFieldsByCategory])

    const clearSelectionForCategory = useCallback(
        (category: SupportedCategories) => {
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
