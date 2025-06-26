import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import ChartCard from 'pages/stats/common/components/ChartCard'
import { TotalTicketSentimentOverTimeGraph } from 'pages/stats/voice-of-customer/charts/TotalTicketSentimentOverTimeChart/TotalTicketSentimentOverTimeGraph'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'pages/stats/voice-of-customer/product-insights/ProductInsightsChartConfig'

const { hint, title } =
    ProductInsightsChartConfig[
        ProductInsightsChart.TotalTicketSentimentOverTimeChart
    ]

export const TotalTicketSentimentOverTimeChart = () => {
    const { sentimentCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    return (
        <ChartCard title={title} hint={hint}>
            {sentimentCustomFieldId && (
                <TotalTicketSentimentOverTimeGraph
                    sentimentCustomFieldId={sentimentCustomFieldId}
                />
            )}
        </ChartCard>
    )
}
