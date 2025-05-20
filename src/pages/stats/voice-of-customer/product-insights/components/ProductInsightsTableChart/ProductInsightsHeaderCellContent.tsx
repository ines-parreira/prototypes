import noop from 'lodash/noop'

import { OrderDirection } from 'models/api/types'
import { HintTooltip } from 'pages/stats/common/HintTooltip'
import {
    getColumnAlignment,
    getColumnWidth,
    getIsLeadColumn,
    ProductInsightsColumnConfig,
    ProductInsightsTableLabels,
} from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTableConfig'
import { ProductTableHeadCell } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductTable'
import { ProductInsightsTableColumns } from 'state/ui/stats/types'

export const ProductInsightsHeaderCellContent = ({
    column,
}: {
    column: ProductInsightsTableColumns
}) => {
    const tooltip = ProductInsightsColumnConfig[column].hint

    return (
        <ProductTableHeadCell
            isOrderedBy={false}
            direction={OrderDirection.Desc}
            onSetSortDirection={noop}
            title={ProductInsightsTableLabels[column]}
            width={getColumnWidth(column)}
            isSticky={getIsLeadColumn(column)}
            justifyContent={getColumnAlignment(column)}
        >
            {tooltip && <HintTooltip {...tooltip} />}
        </ProductTableHeadCell>
    )
}
