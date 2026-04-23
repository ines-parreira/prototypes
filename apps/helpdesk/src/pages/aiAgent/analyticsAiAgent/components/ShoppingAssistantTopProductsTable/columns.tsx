import { DrillDownModalTrigger } from '@repo/reporting'
import type { MetricColumnConfig } from '@repo/reporting'

import { useAiAgentTrendCardDrillDown } from 'domains/reporting/hooks/drill-down/useAiAgentTrendCardDrillDown'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'

const TOP_PRODUCT_RECOMMENDATIONS_METRIC =
    AiAgentDrillDownMetricName.ShoppingAssistantTimesRecommendedColumn

const TimesRecommendedDrillDownCell = ({
    productId,
    value,
}: {
    productId: number
    value: number
}) => {
    const formattedValue = value.toLocaleString()
    const drillDown = useAiAgentTrendCardDrillDown({
        title: 'Product recommendations',
        metricName: TOP_PRODUCT_RECOMMENDATIONS_METRIC,
        productId: productId.toString(),
    })

    if (!drillDown) {
        return formattedValue
    }

    return (
        <DrillDownModalTrigger enabled={true} highlighted={true} {...drillDown}>
            {formattedValue}
        </DrillDownModalTrigger>
    )
}

export const SHOPPING_ASSISTANT_TOP_PRODUCTS_COLUMNS: MetricColumnConfig[] = [
    {
        accessorKey: ProductTableKeys.NumberOfRecommendations,
        label: 'Times recommended',
        tooltipTitle: 'Times recommended',
        tooltipCaption:
            'The number of times a product was recommended by the AI agent.',
        metricFormat: 'integer',
        loadingStateKeys: [ProductTableKeys.NumberOfRecommendations],
        renderCell: (value, row) => {
            if (!value) return null
            return (
                <TimesRecommendedDrillDownCell
                    productId={Number(row.entity)}
                    value={value}
                />
            )
        },
    },
    {
        accessorKey: ProductTableKeys.CTR,
        label: 'Click-through rate',
        tooltipTitle: 'Click-through rate',
        tooltipCaption:
            'The percentage of a product recommendation that customers click.',
        metricFormat: 'decimal-to-percent',
        loadingStateKeys: [ProductTableKeys.CTR],
    },
    {
        accessorKey: ProductTableKeys.BTR,
        label: 'Buy through rate',
        tooltipTitle: 'Buy through rate',
        tooltipCaption:
            'The percentage of a product recommendation that result in a purchase.',
        metricFormat: 'decimal-to-percent',
        loadingStateKeys: [ProductTableKeys.BTR],
    },
]
