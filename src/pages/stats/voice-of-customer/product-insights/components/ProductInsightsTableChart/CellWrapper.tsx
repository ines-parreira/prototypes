import { ReactNode } from 'react'

import {
    getColumnAlignment,
    getColumnWidth,
    getIsLeadColumn,
} from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTableConfig'
import { ProductTableBodyCell } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductTable'
import { ProductInsightsTableColumns } from 'state/ui/stats/types'

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
