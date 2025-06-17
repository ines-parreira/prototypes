import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import ChartCard from 'pages/stats/common/components/ChartCard'
import { TotalProductSentimentOverTimeGraph } from 'pages/stats/voice-of-customer/product-insights/components/TotalProductSentimentOverTimeGraph'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'pages/stats/voice-of-customer/product-insights/ProductInsightsChartConfig'

const { hint, title } =
    ProductInsightsChartConfig[
        ProductInsightsChart.TotalProductSentimentOverTimeChart
    ]

export const TotalProductSentimentOverTimeChart = () => {
    const { sentimentCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    return (
        <ChartCard title={title} hint={hint}>
            {sentimentCustomFieldId && (
                <TotalProductSentimentOverTimeGraph
                    sentimentCustomFieldId={sentimentCustomFieldId}
                />
            )}
        </ChartCard>
    )
}
