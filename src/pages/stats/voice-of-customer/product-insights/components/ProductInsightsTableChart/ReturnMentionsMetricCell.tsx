import { useMemo } from 'react'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useReturnMentionsPerProduct } from 'hooks/reporting/voice-of-customer/metricsPerProduct'
import { OrderDirection } from 'models/api/types'
import { WithDrillDownTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import { CellWrapper } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/CellWrapper'
import { ProductInsightsColumnConfig } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTableConfig'
import { PropsWithProduct } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/types'
import { ReturnMentionsMetric } from 'state/ui/stats/drillDownSlice'
import { ProductInsightsTableColumns } from 'state/ui/stats/types'

export const ReturnMentionsMetricCell = ({
    product,
    intentCustomFieldId,
}: PropsWithProduct & {
    intentCustomFieldId: number
}) => {
    const column = ProductInsightsTableColumns.ReturnMentions
    const { format } = ProductInsightsColumnConfig[column]
    const statsFilters = useStatsFilters()

    const { data, isFetching } = useReturnMentionsPerProduct(
        statsFilters.cleanStatsFilters,
        statsFilters.userTimezone,
        intentCustomFieldId,
        OrderDirection.Desc,
        product.id,
    )

    const formattedMetric = formatMetricValue(
        data?.value,
        format,
        NOT_AVAILABLE_PLACEHOLDER,
    )

    const metricData: ReturnMentionsMetric = useMemo(
        () => ({
            metricName: column,
            productId: product.id,
            intentCustomFieldId,
        }),
        [column, product, intentCustomFieldId],
    )

    return (
        <CellWrapper column={column} isLoading={isFetching}>
            <WithDrillDownTrigger metricData={metricData}>
                {formattedMetric}
            </WithDrillDownTrigger>
        </CellWrapper>
    )
}
