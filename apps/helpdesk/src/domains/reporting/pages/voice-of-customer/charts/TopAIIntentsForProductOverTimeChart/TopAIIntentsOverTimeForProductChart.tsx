import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { TopAIIntentsForProductOverTimeGraph } from 'domains/reporting/pages/voice-of-customer/charts/TopAIIntentsForProductOverTimeChart/TopAIIntentsForProductOverTimeGraph'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'domains/reporting/pages/voice-of-customer/product-insights/ProductInsightsChartConfig'
import { getSidePanelProduct } from 'domains/reporting/state/ui/stats/sidePanelSlice'
import useAppSelector from 'hooks/useAppSelector'
import {
    TICKET_FIELD_ID_NOT_AVAILABLE,
    useGetCustomTicketsFieldsDefinitionData,
} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

export function TopAIIntentsForProductOverTimeChart() {
    const { intentCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()
    const product = useAppSelector(getSidePanelProduct)

    const { hint, title } =
        ProductInsightsChartConfig[
            ProductInsightsChart.TopAIIntentsOverTimeChart
        ]

    return (
        <ChartCard title={title} hint={hint}>
            {product &&
                intentCustomFieldId !== TICKET_FIELD_ID_NOT_AVAILABLE && (
                    <TopAIIntentsForProductOverTimeGraph
                        productId={product.id}
                        intentCustomFieldId={intentCustomFieldId}
                    />
                )}
        </ChartCard>
    )
}
