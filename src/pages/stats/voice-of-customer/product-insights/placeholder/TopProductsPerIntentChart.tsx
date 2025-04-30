import {
    TICKET_FIELD_ID_NOT_AVAILABLE,
    useGetCustomTicketsFieldsDefinitionData,
} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import ChartCard from 'pages/stats/common/components/ChartCard'
import { NoDataAvailable } from 'pages/stats/common/components/NoDataAvailable'
import { TopProductsPerIntentTable } from 'pages/stats/voice-of-customer/product-insights/placeholder/TopProductsPerIntentTable'

export const TOP_PRODUCTS_PER_INTENT_TITLE = 'Top products per intent'
export const TOP_PRODUCTS_PER_INTENT_HINT = {
    title: TOP_PRODUCTS_PER_INTENT_TITLE,
}

export const TopProductsPerIntentChart = () => {
    const { intentCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    return (
        <ChartCard
            title={TOP_PRODUCTS_PER_INTENT_TITLE}
            hint={TOP_PRODUCTS_PER_INTENT_HINT}
        >
            {intentCustomFieldId !== TICKET_FIELD_ID_NOT_AVAILABLE ? (
                <TopProductsPerIntentTable
                    intentsCustomFieldId={intentCustomFieldId}
                />
            ) : (
                <NoDataAvailable />
            )}
        </ChartCard>
    )
}
