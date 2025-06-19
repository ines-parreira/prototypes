import { useEffect } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { useHistory, useParams } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'

import { AiAgentLayout } from './components/AiAgentLayout/AiAgentLayout'
import { SalesSettings } from './components/SalesSettings/SalesSettings'
import { SALES } from './constants'
import { getAiAgentNavigationRoutes } from './hooks/useAiAgentNavigation'
import { useGetShoppingAssistantEnabled } from './hooks/useGetShoppingAssistantEnabled'

import css from './AiAgentSales.less'

export const AiAgentSales = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()
    const flags = useFlags()
    const isSalesPageEnabled = flags[FeatureFlagKey.AiShoppingAssistantEnabled]
    const history = useHistory()
    const analyticsRoute = getAiAgentNavigationRoutes(shopName, flags).analytics
    const strategyRoute = getAiAgentNavigationRoutes(
        shopName,
        flags,
    ).salesStrategy
    const { isEnabled: isShoppingAssistantEnabled, isLoading } =
        useGetShoppingAssistantEnabled({ shopName })

    useEffect(() => {
        if (!isSalesPageEnabled || isLoading) {
            return
        }

        const route = isShoppingAssistantEnabled
            ? analyticsRoute
            : strategyRoute

        history.push(route)
    }, [
        isSalesPageEnabled,
        isLoading,
        isShoppingAssistantEnabled,
        history,
        analyticsRoute,
        strategyRoute,
    ])

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
