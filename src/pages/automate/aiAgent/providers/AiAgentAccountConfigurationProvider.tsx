import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {ReactNode} from 'react'
import {Redirect} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import {useGetOrCreateAccountConfiguration} from 'hooks/aiAgent/useGetOrCreateAccountConfiguration'
import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType, ShopifyIntegration} from 'models/integration/types'
import Spinner from 'pages/common/components/Spinner'
import {getHasAutomate} from 'state/billing/selectors'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {getIntegrationsByType} from 'state/integrations/selectors'

import css from './AiAgentAccountConfigurationProvider.less'

type Props = {
    children?: ReactNode
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
        return (
            <div className={css.spinner}>
                <Spinner size="big" />
            </div>
        )
    }

    return <>{children}</>
}
