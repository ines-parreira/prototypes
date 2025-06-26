import { useMemo } from 'react'

import _isNil from 'lodash/isNil'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useTicketCountPerProductWithEnrichment } from 'hooks/reporting/voice-of-customer/metricsPerProduct'
import { OrderDirection } from 'models/api/types'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import { CellWrapper } from 'pages/stats/voice-of-customer/components/ProductInsightsTable/CellWrapper'
import { ProductInsightsColumnConfig } from 'pages/stats/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import { PropsWithProduct } from 'pages/stats/voice-of-customer/components/ProductInsightsTable/types'
import { DrillDownMetric } from 'state/ui/stats/drillDownSlice'
import { ProductInsightsTableColumns } from 'state/ui/stats/types'

export const TicketsVolumeMetricCell = ({ product }: PropsWithProduct) => {
    const column = ProductInsightsTableColumns.TicketsVolume
    const { format } = ProductInsightsColumnConfig[column]
    const statsFilters = useStatsFilters()

    const { data, isFetching } = useTicketCountPerProductWithEnrichment(
        statsFilters.cleanStatsFilters,
        statsFilters.userTimezone,
        OrderDirection.Desc,
        product.id,
    )

    const formattedMetric = formatMetricValue(
        data?.value,
        format,
        NOT_AVAILABLE_PLACEHOLDER,
    )

    const metricData: DrillDownMetric = useMemo(
        () => ({
            title: product.name,
            metricName: column,
            productId: product.id,
        }),
        [column, product],
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
