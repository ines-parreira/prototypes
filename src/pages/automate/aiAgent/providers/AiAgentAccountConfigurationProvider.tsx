import React from 'react'
import {Redirect} from 'react-router-dom'
import {useGetOrCreateAccountConfiguration} from 'hooks/aiAgent/useGetOrCreateAccountConfiguration'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import Loader from 'pages/common/components/Loader/Loader'
import {getIntegrationsByType} from 'state/integrations/selectors'
import {IntegrationType, ShopifyIntegration} from 'models/integration/types'

type Props = {
    children?: React.ReactNode
}

export const AiAgentAccountConfigurationProvider = ({children}: Props) => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const shopifyIntegrations = useAppSelector(
        getIntegrationsByType<ShopifyIntegration>(IntegrationType.Shopify)
    )

    const accountId = currentAccount.get('id')
    const accountDomain = currentAccount.get('domain')
    const storeNames = shopifyIntegrations.map(
        (integration) => integration.meta.shop_name
    )

    const {status: accountConfigRetrievalStatus} =
        useGetOrCreateAccountConfiguration(
            {accountId, accountDomain, storeNames},
            {refetchOnWindowFocus: false}
        )

    if (!hasAutomate || accountConfigRetrievalStatus === 'error') {
        return <Redirect to="/app/automation" />
    }

    if (accountConfigRetrievalStatus !== 'success') {
        return <Loader />
    }

    return <>{children}</>
}
