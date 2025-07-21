import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { TotalTicketSentimentOverTimeGraph } from 'domains/reporting/pages/voice-of-customer/charts/TotalTicketSentimentOverTimeChart/TotalTicketSentimentOverTimeGraph'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'domains/reporting/pages/voice-of-customer/product-insights/ProductInsightsChartConfig'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

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
