import { UserRole } from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import {
    TICKET_FIELD_ID_NOT_AVAILABLE,
    useGetCustomTicketsFieldsDefinitionData,
} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import ChartCard from 'pages/stats/common/components/ChartCard'
import { NoDataAvailable } from 'pages/stats/common/components/NoDataAvailable'
import { ProductInsightsEditColumns } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsEditColumns'
import { ProductInsightsTable } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTable'
import { getCurrentUser } from 'state/currentUser/selectors'
import { hasRole } from 'utils'

export const PRODUCT_INSIGHTS_TABLE_TITLE = 'Product centric insights'

export const ProductInsightsTableChart = () => {
    const currentUser = useAppSelector(getCurrentUser)
    const isAdmin = hasRole(currentUser, UserRole.Admin)
    const { intentCustomFieldId, sentimentCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    return (
        <ChartCard
            title={PRODUCT_INSIGHTS_TABLE_TITLE}
            titleExtra={isAdmin && <ProductInsightsEditColumns />}
            noPadding
        >
            {intentCustomFieldId !== TICKET_FIELD_ID_NOT_AVAILABLE &&
            sentimentCustomFieldId ? (
                <ProductInsightsTable
                    intentCustomFieldId={intentCustomFieldId}
                    sentimentCustomFieldId={sentimentCustomFieldId}
                />
            ) : (
                <NoDataAvailable />
            )}
        </ChartCard>
    )
}
