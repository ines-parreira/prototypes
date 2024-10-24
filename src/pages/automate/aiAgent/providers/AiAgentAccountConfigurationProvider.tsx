import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'
import {Redirect} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import {useGetOrCreateAccountConfiguration} from 'hooks/aiAgent/useGetOrCreateAccountConfiguration'
import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType, ShopifyIntegration} from 'models/integration/types'
import Loader from 'pages/common/components/Loader/Loader'
import {getHasAutomate} from 'state/billing/selectors'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {getIntegrationsByType} from 'state/integrations/selectors'

type Props = {
    children?: React.ReactNode
}

export const AiAgentAccountConfigurationProvider = ({children}: Props) => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const shopifyIntegrations = useAppSelector(
        getIntegrationsByType<ShopifyIntegration>(IntegrationType.Shopify)
    )
    const hasAiAgentTrial = useFlags()[FeatureFlagKey.AiAgentTrialMode]

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

    if (
        !(hasAiAgentTrial || hasAutomate) ||
        accountConfigRetrievalStatus === 'error'
    ) {
        return <Redirect to="/app/automation" />
    }

    if (accountConfigRetrievalStatus !== 'success') {
        return <Loader data-testid="aiAgentProviderLoader" />
    }

    return <>{children}</>
}
