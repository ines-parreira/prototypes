import { useParams } from 'react-router-dom'

import useEffectOnce from 'hooks/useEffectOnce'
import css from 'pages/aiAgent/AiAgentSales.less'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { SalesSettings } from 'pages/aiAgent/components/SalesSettings/SalesSettings'
import { SALES } from 'pages/aiAgent/constants'

import { useShoppingAssistantTracking } from './hooks/useShoppingAssistantTracking'

export const AiAgentSalesStrategy = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    const { onShoppingAssistantStrategyViewed } = useShoppingAssistantTracking({
        shopName,
    })

    useEffectOnce(() => {
        onShoppingAssistantStrategyViewed()
    })

    return (
        <AiAgentLayout
            shopName={shopName}
            className={css.container}
            title={SALES}
        >
            <SalesSettings />
        </AiAgentLayout>
    )
}
