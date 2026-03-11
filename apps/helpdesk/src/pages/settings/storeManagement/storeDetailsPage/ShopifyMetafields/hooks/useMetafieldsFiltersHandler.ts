import { useCallback } from 'react'

import type { TableV1Instance } from '@gorgias/axiom'

type UseMetafieldsFiltersHandlerParams<T> = {
    table: TableV1Instance<T>
    filterColumns: string[]
}

type FilterOption = Record<string, unknown> & {
    id: string
    label: string
}

export function useMetafieldsFiltersHandler<T>({
    table,
    filterColumns,
}: UseMetafieldsFiltersHandlerParams<T>) {
    return useCallback(
        (filters: Record<string, unknown>) => {
            filterColumns.forEach((columnName) => {
                const filterValue = filters[columnName] as
                    | FilterOption
                    | undefined
                const column = table.getColumn(columnName)
                column?.setFilterValue(
                    filterValue?.[columnName] ?? filterValue?.id,
                )
            })
        },
        [table, filterColumns],
    )
}
