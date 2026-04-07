import { useEffect } from 'react'

import { useHistory, useParams } from 'react-router-dom'

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
    const history = useHistory()
    const analyticsRoute = getAiAgentNavigationRoutes(shopName).analytics
    const strategyRoute = getAiAgentNavigationRoutes(shopName).salesStrategy
    const { isEnabled: isShoppingAssistantEnabled, isLoading } =
        useGetShoppingAssistantEnabled({ shopName })

    useEffect(() => {
        if (isLoading) {
            return
        }

        history.replace(strategyRoute)
    }, [
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
