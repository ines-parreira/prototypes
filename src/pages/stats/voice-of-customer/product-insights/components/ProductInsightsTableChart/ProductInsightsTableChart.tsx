import { UserRole } from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import ChartCard from 'pages/stats/common/components/ChartCard'
import { ProductInsightsEditColumns } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsEditColumns'
import { ProductInsightsTable } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTable'
import { getCurrentUser } from 'state/currentUser/selectors'
import { hasRole } from 'utils'

export const PRODUCT_INSIGHTS_TABLE_TITLE = 'Product centric insights'

export const ProductInsightsTableChart = () => {
    const currentUser = useAppSelector(getCurrentUser)
    const isAdmin = hasRole(currentUser, UserRole.Admin)

    return (
        <ChartCard
            title={PRODUCT_INSIGHTS_TABLE_TITLE}
            titleExtra={isAdmin && <ProductInsightsEditColumns />}
            noPadding
        >
            <ProductInsightsTable />
        </ChartCard>
    )
}
