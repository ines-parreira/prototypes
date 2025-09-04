import { ReactNode } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { Redirect } from 'react-router-dom'

import { LoadingSpinner } from '@gorgias/axiom'

import { useFlag } from 'core/flags'
import { useGetOrCreateAccountConfiguration } from 'hooks/aiAgent/useGetOrCreateAccountConfiguration'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType, ShopifyIntegration } from 'models/integration/types'
import { getHasAutomate } from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getIntegrationsByType } from 'state/integrations/selectors'

import { useCanEnableAiAgentDuringTrial } from '../Overview/hooks/useCanEnableAiAgentDuringTrial'
import { TrialPaywallMiddleware } from '../Overview/middlewares/TrialPaywallMiddleware'

import css from './AiAgentAccountConfigurationProvider.less'

type Props = {
    children?: ReactNode
}

export const AiAgentAccountConfigurationProvider = ({ children }: Props) => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const shopifyIntegrations = useAppSelector(
        getIntegrationsByType<ShopifyIntegration>(IntegrationType.Shopify),
    )
    const hasAiAgentPreview = useFlag(FeatureFlagKey.AIAgentPreviewModeAllowed)

    const { storeIntegration, isDuringTrial, isLoading, isError } =
        useCanEnableAiAgentDuringTrial()

    const isAiAgentExpandingTrialExperienceForAllEnabled = useFlag(
        FeatureFlagKey.AiAgentExpandingTrialExperienceForAll,
        'loading_state',
    )

    const accountId = currentAccount.get('id')
    const accountDomain = currentAccount.get('domain')
    const storeNames = shopifyIntegrations.map(
        (integration) => integration.meta.shop_name,
    )

    const { status: accountConfigRetrievalStatus } =
        useGetOrCreateAccountConfiguration(
            { accountId, accountDomain, storeNames },
            { refetchOnWindowFocus: false },
        )

    if (
        !isError &&
        (isAiAgentExpandingTrialExperienceForAllEnabled === 'loading_state' ||
            isLoading)
    ) {
        return (
            <div className={css.spinner}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    if (!hasAutomate && isDuringTrial) {
        return <>{children}</>
    }

    if (!hasAutomate && isAiAgentExpandingTrialExperienceForAllEnabled) {
        return (
            <TrialPaywallMiddleware
                shopName={storeIntegration?.meta.shop_name}
            />
        )
    }

    if (
        !(hasAiAgentPreview || hasAutomate) ||
        accountConfigRetrievalStatus === 'error'
    ) {
        return <Redirect to="/app/automation" />
    }

    if (accountConfigRetrievalStatus !== 'success') {
        return (
            <div className={css.spinner}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    return <>{children}</>
}
