import { ReactNode } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { Redirect, useParams } from 'react-router-dom'

import { Heading, LoadingSpinner } from '@gorgias/axiom'

import { useFlag } from 'core/flags'
import { useCanUseAiAgent } from 'hooks/aiAgent/useCanUseAiAgent'
import { useGetOrCreateAccountConfiguration } from 'hooks/aiAgent/useGetOrCreateAccountConfiguration'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType, ShopifyIntegration } from 'models/integration/types'
import { getHasAutomate } from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getIntegrationsByType } from 'state/integrations/selectors'

import { useInitializePostOnboardingSteps } from '../Overview/hooks/useInitializePostOnboardingSteps'
import { TrialPaywallMiddleware } from '../Overview/middlewares/TrialPaywallMiddleware'

import css from './AiAgentAccountConfigurationProvider.less'

type Props = {
    children?: ReactNode
}

export const AiAgentAccountConfigurationProvider = ({ children }: Props) => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()
    const hasAutomate = useAppSelector(getHasAutomate)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const shopifyIntegrations = useAppSelector(
        getIntegrationsByType<ShopifyIntegration>(IntegrationType.Shopify),
    )
    const hasAiAgentPreview = useFlag(FeatureFlagKey.AIAgentPreviewModeAllowed)

    const aiAgentPostOnboardingStepsEnabled = useFlag(
        FeatureFlagKey.AiAgentPostOnboardingSteps,
        false,
    )

    const aiAgentPostStoreInstallationStepsEnabled = useFlag(
        FeatureFlagKey.AiAgentPostStoreInstallationSteps,
        false,
    )

    const isNewModeEnabledViaFeatureFlag =
        aiAgentPostOnboardingStepsEnabled ||
        aiAgentPostStoreInstallationStepsEnabled

    const { storeIntegration, isCurrentStoreDuringTrial, isLoading, isError } =
        useCanUseAiAgent()

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

    const { isLoading: isPostOnboardingStepsLoading } =
        useInitializePostOnboardingSteps(
            shopName,
            shopType,
            isNewModeEnabledViaFeatureFlag,
        )

    const LoadingState = () => (
        <div className={css.spinner}>
            <LoadingSpinner size="big" />
            <Heading size="sm">We’re preparing your space...</Heading>
        </div>
    )

    if (
        !isError &&
        (isAiAgentExpandingTrialExperienceForAllEnabled === 'loading_state' ||
            isLoading ||
            isPostOnboardingStepsLoading)
    ) {
        return <LoadingState />
    }

    if (!hasAutomate && isCurrentStoreDuringTrial) {
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

    if (
        accountConfigRetrievalStatus !== 'success' ||
        isPostOnboardingStepsLoading
    ) {
        return <LoadingState />
    }

    return <>{children}</>
}
