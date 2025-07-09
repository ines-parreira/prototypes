import { useState } from 'react'

import { useIntentTicketCountsAndDelta } from 'hooks/reporting/voice-of-customer/useIntentTicketCountsAndDelta'
import { TableWithNestedRows } from 'pages/stats/common/components/Table/TableWithNestedRows'
import { IntentRows } from 'pages/stats/voice-of-customer/charts/TopProductsPerAIIntentChart/IntentRows'
import {
    LeadColumn,
    TOP_INTENTS_PER_PAGE,
    TopIntentsColumns,
    TopProductsPerIntentColumnConfig,
    TopProductsTableColumnsForIntents,
} from 'pages/stats/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerAIIntentConfig'
import {
    TopIntentsRowProps,
    TopProductsPerIntentOrder,
} from 'pages/stats/voice-of-customer/charts/TopProductsPerAIIntentChart/types'
import {
    DEFAULT_SORTING_COLUMN,
    DEFAULT_SORTING_DIRECTION,
} from 'pages/stats/voice-of-customer/constants'
import {
    formatProductsPerIntentsTableData,
    getColumnsSortingValue,
} from 'pages/stats/voice-of-customer/product-insights/helpers'

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
