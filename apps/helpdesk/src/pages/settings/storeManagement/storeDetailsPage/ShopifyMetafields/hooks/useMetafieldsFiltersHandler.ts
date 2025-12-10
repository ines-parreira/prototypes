import { useCallback } from 'react'

import type { Table } from '@gorgias/axiom'

type UseMetafieldsFiltersHandlerParams<T> = {
    table: Table<T>
}

export function useMetafieldsFiltersHandler<T>({
    table,
}: UseMetafieldsFiltersHandlerParams<T>) {
    return useCallback(
        (filters: Record<string, unknown>) => {
            const typeFilter = filters.type as
                | { id: string; type: string; label: string }
                | undefined
            table.getColumn('type')?.setFilterValue(typeFilter?.type)
        },
        [table],
    )
}
