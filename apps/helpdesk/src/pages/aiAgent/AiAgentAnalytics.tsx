import { useEffectOnce } from '@repo/hooks'
import { useParams } from 'react-router-dom'

import SalesOverview from 'domains/reporting/pages/automate/aiSalesAgent/components/SalesOverview'
import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import DefaultStatsFilters from 'domains/reporting/pages/DefaultStatsFilters'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'

import { SALES } from './constants'
import { useShoppingAssistantTracking } from './hooks/useShoppingAssistantTracking'

import css from './AiAgentAnalytics.less'

export const AiAgentAnalytics = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    const { onShoppingAssistantAnalyticsViewed } = useShoppingAssistantTracking(
        { shopName },
    )

    useEffectOnce(() => {
        onShoppingAssistantAnalyticsViewed()
    })

    return (
        <DefaultStatsFilters>
            <DrillDownModal />
            <AiAgentLayout
                className={css.container}
                shopName={shopName}
                title={SALES}
            >
                <SalesOverview />
            </AiAgentLayout>
        </DefaultStatsFilters>
    )
}
