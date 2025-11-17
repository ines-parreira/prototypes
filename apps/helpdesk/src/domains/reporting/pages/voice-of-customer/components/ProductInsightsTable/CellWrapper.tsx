import type { ReactNode } from 'react'

import {
    getColumnAlignment,
    getColumnWidth,
    getIsLeadColumn,
} from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import { ProductTableBodyCell } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductTable'
import type { ProductInsightsTableColumns } from 'domains/reporting/state/ui/stats/types'

export const CellWrapper = ({
    children,
    isLoading,
    column,
}: {
    column: ProductInsightsTableColumns
    children: ReactNode
    isLoading?: boolean
}) => (
    <ProductTableBodyCell
        isLoading={isLoading}
        width={getColumnWidth(column)}
        isSticky={getIsLeadColumn(column)}
        justifyContent={getColumnAlignment(column)}
    >
        {children}
    </ProductTableBodyCell>
)
