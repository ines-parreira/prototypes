import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import { TopProductsPerIntentTable } from 'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerIntentTable'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'domains/reporting/pages/voice-of-customer/product-insights/ProductInsightsChartConfig'
import {
    TICKET_FIELD_ID_NOT_AVAILABLE,
    useGetCustomTicketsFieldsDefinitionData,
} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

export const TopProductsPerAIIntentChart = () => {
    const { intentCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    const { title, hint } =
        ProductInsightsChartConfig[
            ProductInsightsChart.TopProductsPerAIIntentChart
        ]

    return (
        <ChartCard title={title} hint={hint} noPadding>
            {intentCustomFieldId !== TICKET_FIELD_ID_NOT_AVAILABLE ? (
                <TopProductsPerIntentTable
                    intentCustomFieldId={intentCustomFieldId}
                />
            ) : (
                <NoDataAvailable />
            )}
        </ChartCard>
    )
}
