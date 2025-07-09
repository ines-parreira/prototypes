import {
    TICKET_FIELD_ID_NOT_AVAILABLE,
    useGetCustomTicketsFieldsDefinitionData,
} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import ChartCard from 'pages/stats/common/components/ChartCard'
import { NoDataAvailable } from 'pages/stats/common/components/NoDataAvailable'
import { TopProductsPerIntentTable } from 'pages/stats/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerIntentTable'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'pages/stats/voice-of-customer/product-insights/ProductInsightsChartConfig'

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
