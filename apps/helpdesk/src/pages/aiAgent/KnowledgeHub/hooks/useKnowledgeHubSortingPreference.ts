import { useMemo } from 'react'

import { useLocalStorage } from '@repo/hooks'

import type { SortingState } from '@gorgias/axiom'

import { METRICS_COLUMN_PREFIX } from '../Table/columns'

const STORAGE_KEY = 'knowledge-hub-table-sort'
const DEFAULT_SORT: SortingState = [{ id: 'lastUpdatedAt', desc: true }]

/**
 * Type guard to validate if a value conforms to SortingState structure.
 * Ensures runtime type safety for localStorage data.
 */
function isSortingState(value: unknown): value is SortingState {
    if (!Array.isArray(value) || value.length === 0) return false
    const first = value[0]
    return typeof first?.id === 'string' && typeof first?.desc === 'boolean'
}

/**
 * Detects if a column ID represents a metrics column.
 */
const isMetricsColumn = (columnId: string): boolean => {
    return columnId.startsWith(METRICS_COLUMN_PREFIX)
}

/**
 * Manages persistent sorting preferences for the Knowledge Hub table.
 *
 * Uses @repo/hooks/useLocalStorage for automatic persistence and multi-tab sync.
 * Validates sort state against available columns and handles metrics columns specially.
 *
 * @param availableColumnIds - List of valid column IDs for validation.
 *                             If empty, validation is skipped (backward compatible).
 * @returns Object containing sortState and setSortState function
 *
 * @example
 * ```tsx
 * const { sortState, setSortState } = useKnowledgeHubSortingPreference(
 *   ['title', 'lastUpdatedAt', 'metrics.tickets']
 * )
 * ```
 */
export const useKnowledgeHubSortingPreference = (
    availableColumnIds: string[] = [],
) => {
    const [rawSortState, setRawSortState] = useLocalStorage<SortingState>(
        STORAGE_KEY,
        DEFAULT_SORT,
    )

    const validatedRawState = useMemo(() => {
        if (!isSortingState(rawSortState)) return DEFAULT_SORT
        return rawSortState
    }, [rawSortState])

    const sortState = useMemo(() => {
        if (availableColumnIds.length === 0) {
            return validatedRawState
        }

        if (validatedRawState.length > 0 && validatedRawState[0].id) {
            const sortColumnId = validatedRawState[0].id
            const isValidColumn = availableColumnIds.includes(sortColumnId)

            if (!isValidColumn) {
                // Special handling for metrics columns during initial load
                // Metrics columns may not be in availableColumnIds yet due to race condition
                if (isMetricsColumn(sortColumnId)) {
                    return validatedRawState
                }

                // For non-metrics columns, fall back to default if invalid
                return DEFAULT_SORT
            }
        }

        return validatedRawState
    }, [validatedRawState, availableColumnIds])

    return {
        sortState,
        setSortState: setRawSortState,
    }
}
