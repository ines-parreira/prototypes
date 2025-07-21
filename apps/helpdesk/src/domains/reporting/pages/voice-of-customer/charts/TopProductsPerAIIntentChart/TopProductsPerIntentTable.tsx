import { useState } from 'react'

import { useIntentTicketCountsAndDelta } from 'domains/reporting/hooks/voice-of-customer/useIntentTicketCountsAndDelta'
import { TableWithNestedRows } from 'domains/reporting/pages/common/components/Table/TableWithNestedRows'
import { IntentRows } from 'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/IntentRows'
import {
    LeadColumn,
    TOP_INTENTS_PER_PAGE,
    TopIntentsColumns,
    TopProductsPerIntentColumnConfig,
    TopProductsTableColumnsForIntents,
} from 'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerAIIntentConfig'
import {
    TopIntentsRowProps,
    TopProductsPerIntentOrder,
} from 'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/types'
import {
    DEFAULT_SORTING_COLUMN,
    DEFAULT_SORTING_DIRECTION,
} from 'domains/reporting/pages/voice-of-customer/constants'
import {
    formatProductsPerIntentsTableData,
    getColumnsSortingValue,
} from 'domains/reporting/pages/voice-of-customer/product-insights/helpers'

export const TopProductsPerIntentTable = ({
    intentCustomFieldId,
}: {
    intentCustomFieldId: number
}) => {
    const [order, setOrder] = useState<TopProductsPerIntentOrder>({
        column: DEFAULT_SORTING_COLUMN,
        direction: DEFAULT_SORTING_DIRECTION,
    })

    const { data, isFetching } = useIntentTicketCountsAndDelta(
        intentCustomFieldId,
        order.direction,
        getColumnsSortingValue(order.column),
    )

    return (
        <TableWithNestedRows<TopIntentsRowProps, TopIntentsColumns>
            RowComponent={IntentRows}
            rows={formatProductsPerIntentsTableData(data, intentCustomFieldId)}
            perPage={TOP_INTENTS_PER_PAGE}
            columnOrder={TopProductsTableColumnsForIntents}
            leadColumn={LeadColumn}
            sortingOrder={order}
            columnConfig={TopProductsPerIntentColumnConfig}
            getSetOrderHandler={setOrder}
            isScrollable={false}
            intentCustomFieldId={intentCustomFieldId}
            isLoading={isFetching}
        />
    )
}
