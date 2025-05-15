import { useFlags } from 'launchdarkly-react-client-sdk'
import { useHistory, useParams } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'

import { AiAgentLayout } from './components/AiAgentLayout/AiAgentLayout'
import { SalesSettings } from './components/SalesSettings/SalesSettings'
import { SALES } from './constants'
import { getAiAgentNavigationRoutes } from './hooks/useAiAgentNavigation'

import css from './AiAgentSales.less'

export const AiAgentSales = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()
    const flags = useFlags()
    const isSalesPageEnabled = flags[FeatureFlagKey.AiShoppingAssistantEnabled]
    const history = useHistory()
    const analyticsRoute = getAiAgentNavigationRoutes(shopName, flags).analytics

    if (isSalesPageEnabled) {
        // Redirects to analytics as it's the first tab on the sales page
        history.push(analyticsRoute)
    }

    return (
        <AiAgentLayout
            shopName={shopName}
            className={css.container}
            title={SALES}
            hideViewAiAgentTicketsButton
        >
            <div className={css.sales}>
                <SalesSettings />
            </div>
        </AiAgentLayout>
    )
}
