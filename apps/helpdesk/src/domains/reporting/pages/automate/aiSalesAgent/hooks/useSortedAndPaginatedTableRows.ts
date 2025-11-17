import { useMemo } from 'react'

import type { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import type { ProductTableContentCell } from 'domains/reporting/pages/automate/aiSalesAgent/types/productTable'
import type { OrderDirection } from 'models/api/types'

type Options = {
    offset: number
    page: number
    orderKey?: ProductTableKeys
    orderDirection: OrderDirection
    transform: (cell: ProductTableContentCell, key: ProductTableKeys) => any
}

export function useSortedAndPaginatedTableRows(
    rows: ProductTableContentCell[],
    options: Options,
) {
    const sortedRows = useMemo(() => {
        if (options.orderKey) {
            return [...rows].sort((a, b) => {
                let aValue = options.transform(
                    a,
                    options.orderKey as ProductTableKeys,
                )
                let bValue = options.transform(
                    b,
                    options.orderKey as ProductTableKeys,
                )

                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase()
                }

                if (typeof bValue === 'string') {
                    bValue = bValue.toLowerCase()
                }

                if (aValue < bValue) {
                    return options.orderDirection === 'asc' ? -1 : 1
                }

                if (aValue > bValue) {
                    return options.orderDirection === 'asc' ? 1 : -1
                }

                return 0
            })
        }
        return rows
    }, [rows, options])

    return useMemo(() => {
        if (options.offset + options.page >= sortedRows.length) {
            return sortedRows.slice(options.offset)
        }

        return sortedRows.slice(options.offset, options.offset + options.page)
    }, [sortedRows, options.page, options.offset])
}
