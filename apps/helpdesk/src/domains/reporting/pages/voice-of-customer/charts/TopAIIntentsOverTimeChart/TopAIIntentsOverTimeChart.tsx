import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { TopAIIntentsOverTimeGraph } from 'domains/reporting/pages/voice-of-customer/charts/TopAIIntentsOverTimeChart/TopAIIntentsOverTimeGraph'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'domains/reporting/pages/voice-of-customer/product-insights/ProductInsightsChartConfig'
import {
    TICKET_FIELD_ID_NOT_AVAILABLE,
    useGetCustomTicketsFieldsDefinitionData,
} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

const { hint, title } =
    ProductInsightsChartConfig[ProductInsightsChart.TopAIIntentsOverTimeChart]

export function TopAIIntentsOverTimeChart() {
    const { intentCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    return (
        <ChartCard title={title} hint={hint}>
            {intentCustomFieldId !== TICKET_FIELD_ID_NOT_AVAILABLE && (
                <TopAIIntentsOverTimeGraph
                    intentCustomFieldId={intentCustomFieldId}
                />
            )}
        </ChartCard>
    )
}
