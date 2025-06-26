import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import ChartCard from 'pages/stats/common/components/ChartCard'
import { TopAIIntentsOverTimeGraph } from 'pages/stats/voice-of-customer/charts/TopAIIntentsOverTimeChart/TopAIIntentsOverTimeGraph'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'pages/stats/voice-of-customer/product-insights/ProductInsightsChartConfig'

const { hint, title } =
    ProductInsightsChartConfig[ProductInsightsChart.TopAIIntentsOverTimeChart]

export function TopAIIntentsOverTimeChart() {
    const { intentCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    return (
        <ChartCard title={title} hint={hint}>
            <TopAIIntentsOverTimeGraph
                intentCustomFieldId={intentCustomFieldId}
            />
        </ChartCard>
    )
}
