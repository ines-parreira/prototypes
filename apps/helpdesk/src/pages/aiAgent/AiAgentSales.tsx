import { useEffect } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useHistory, useParams } from 'react-router-dom'

import { useFlag } from 'core/flags'

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
    const isSalesPageEnabled = useFlag(
        FeatureFlagKey.AiShoppingAssistantEnabled,
    )
    const history = useHistory()
    const analyticsRoute = getAiAgentNavigationRoutes(shopName).analytics
    const strategyRoute = getAiAgentNavigationRoutes(shopName).salesStrategy
    const { isEnabled: isShoppingAssistantEnabled, isLoading } =
        useGetShoppingAssistantEnabled({ shopName })

    useEffect(() => {
        if (!isSalesPageEnabled || isLoading) {
            return
        }

        history.replace(strategyRoute)
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
        >
            <div className={css.sales}>
                <SalesSettings />
            </div>
        </AiAgentLayout>
    )
}
