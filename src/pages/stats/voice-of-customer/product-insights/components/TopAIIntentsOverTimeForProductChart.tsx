import useAppSelector from 'hooks/useAppSelector'
import {
    TICKET_FIELD_ID_NOT_AVAILABLE,
    useGetCustomTicketsFieldsDefinitionData,
} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import ChartCard from 'pages/stats/common/components/ChartCard'
import { TopAIIntentsForProductOverTimeGraph } from 'pages/stats/voice-of-customer/product-insights/components/TopAIIntentsForProductOverTimeGraph'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'pages/stats/voice-of-customer/product-insights/ProductInsightsChartConfig'
import { getSidePanelProduct } from 'state/ui/stats/sidePanelSlice'

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
