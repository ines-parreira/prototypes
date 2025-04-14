import noop from 'lodash/noop'

import { OrderDirection } from 'models/api/types'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import { HintTooltip } from 'pages/stats/common/HintTooltip'
import {
    LeadColumn,
    ProductInsightsColumnConfig,
    ProductInsightsTableLabels,
} from 'pages/stats/voice-of-customer/product-insights/placeholder/ProductInsightsTableConfig'
import { ProductInsightsTableColumns } from 'state/ui/stats/types'

type ProductInsightsHeaderCellContentProps = {
    column: ProductInsightsTableColumns
    width: number
    className?: string
}

export const ProductInsightsHeaderCellContent = ({
    className,
    column,
    width,
}: ProductInsightsHeaderCellContentProps) => {
    const sortCallback = noop
    const isOrderedBy = true
    const direction: OrderDirection = OrderDirection.Desc
    const tooltip = ProductInsightsColumnConfig[column].hint

    return (
        <HeaderCellProperty
            isOrderedBy={isOrderedBy}
            direction={direction}
            onClick={sortCallback}
            title={ProductInsightsTableLabels[column]}
            wrapContent
            justifyContent={column === LeadColumn ? 'left' : 'right'}
            height={'comfortable'}
            width={width}
            className={className}
        >
            {tooltip && <HintTooltip {...tooltip} />}
        </HeaderCellProperty>
    )
}
