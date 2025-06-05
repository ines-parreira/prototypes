import {
    TICKET_FIELD_ID_NOT_AVAILABLE,
    useGetCustomTicketsFieldsDefinitionData,
} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import ChartCard from 'pages/stats/common/components/ChartCard'
import { NoDataAvailable } from 'pages/stats/common/components/NoDataAvailable'
import { TopProductsPerIntentTable } from 'pages/stats/voice-of-customer/product-insights/TopProductsPerIntentTable'

export const TOP_PRODUCTS_PER_INTENT_TITLE = 'Top products per intent'
export const TOP_PRODUCTS_PER_INTENT_HINT = {
    title: 'Top products based on ticket volume per AI Intent. Sort by specific products using filters.',
}

export const TopProductsPerIntentChart = () => {
    const { intentCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    return (
        <ChartCard
            title={TOP_PRODUCTS_PER_INTENT_TITLE}
            hint={TOP_PRODUCTS_PER_INTENT_HINT}
            noPadding
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
