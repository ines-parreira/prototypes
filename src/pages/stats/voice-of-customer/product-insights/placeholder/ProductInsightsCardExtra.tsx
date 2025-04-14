import { UserRole } from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import css from 'pages/stats/support-performance/agents/AgentsPerformanceCardExtra.less'
import { ProductInsightsEditColumns } from 'pages/stats/voice-of-customer/product-insights/placeholder/ProductInsightsEditColumns'
import { getCurrentUser } from 'state/currentUser/selectors'
import { hasRole } from 'utils'

export const ProductInsightsCardExtra = () => {
    const currentUser = useAppSelector(getCurrentUser)

    return (
        <div className={css.wrapper}>
            {hasRole(currentUser, UserRole.Admin) && (
                <ProductInsightsEditColumns />
            )}
        </div>
    )
}
