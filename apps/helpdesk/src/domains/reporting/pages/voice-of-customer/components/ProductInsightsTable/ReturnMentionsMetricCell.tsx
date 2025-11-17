import { useMemo } from 'react'

import _isNil from 'lodash/isNil'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useReturnMentionsPerProduct } from 'domains/reporting/hooks/voice-of-customer/metricsPerProduct'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import { CellWrapper } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/CellWrapper'
import { ProductInsightsColumnConfig } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import type { PropsWithProduct } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/types'
import type { ReturnMentionsMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { ProductInsightsTableColumns } from 'domains/reporting/state/ui/stats/types'
import { OrderDirection } from 'models/api/types'

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

    const isDrillDownEnabled = !_isNil(data?.value)

    return (
        <CellWrapper column={column} isLoading={isFetching}>
            <DrillDownModalTrigger
                metricData={metricData}
                enabled={isDrillDownEnabled}
                highlighted
            >
                {formattedMetric}
            </DrillDownModalTrigger>
        </CellWrapper>
    )
}
