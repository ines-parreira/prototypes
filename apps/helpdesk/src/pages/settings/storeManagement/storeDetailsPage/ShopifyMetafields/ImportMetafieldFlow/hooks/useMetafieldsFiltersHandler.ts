import { useCallback } from 'react'

import type { Table } from '@gorgias/axiom'

import type { Field } from '../../MetafieldsTable/types'

type UseMetafieldsFiltersHandlerParams = {
    table: Table<Field>
}

export function useMetafieldsFiltersHandler({
    table,
}: UseMetafieldsFiltersHandlerParams) {
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
