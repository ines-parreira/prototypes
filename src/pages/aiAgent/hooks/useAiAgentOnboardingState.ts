import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { useStoreConfiguration } from './useStoreConfiguration'
import { useWelcomePageAcknowledged } from './useWelcomePageAcknowledged'

type WelcomePageFeatureFlag =
    | undefined
    | 'off'
    | 'dynamic_odd_static_even'
    | 'static_odd_dynamic_even'

const isWelcomeDynamic = (
    welcomePageFeatureFlag: WelcomePageFeatureFlag,
    accountId: number,
) =>
    (welcomePageFeatureFlag === 'dynamic_odd_static_even' &&
        accountId % 2 !== 0) ||
    (welcomePageFeatureFlag === 'static_odd_dynamic_even' &&
        accountId % 2 === 0)

export enum OnboardingState {
    Loading = 'loading',
    WelcomeStatic = 'welcomeStatic',
    WelcomeDynamic = 'welcomeDynamic',
    OnboardingWizard = 'onboardingWizard',
    Onboarded = 'onboarded',
}

export const useAiAgentOnboardingState = (
    shopName: string,
    isLoading?: boolean,
): OnboardingState => {
    const welcomePageFeatureFlag: WelcomePageFeatureFlag =
        useFlags()[FeatureFlagKey.AIAgentWelcomePage]
    const isAiAgentOnboardingWizardEnabled =
        useFlags()[FeatureFlagKey.AiAgentOnboardingWizard]

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountId = currentAccount.get('id')
    const accountDomain = currentAccount.get('domain')

    const { isLoading: isStoreConfigurationLoading, storeConfiguration } =
        useStoreConfiguration({
            shopName,
            accountDomain,
        })

    const isOnUpdateOnboardingWizard =
        storeConfiguration?.wizard?.completedDatetime === null

    const {
        isLoading: isWelcomePageAcknowledgedLoading,
        data: welcomePageAcknowledged,
    } = useWelcomePageAcknowledged({
        accountDomain,
        shopName,
    })

    if (
        isStoreConfigurationLoading ||
        isWelcomePageAcknowledgedLoading ||
        isLoading
    )
        return OnboardingState.Loading

    const displayWelcomePage =
        ['dynamic_odd_static_even', 'static_odd_dynamic_even'].includes(
            welcomePageFeatureFlag ?? '',
        ) &&
        !storeConfiguration &&
        welcomePageAcknowledged?.acknowledged !== true

    if (!isAiAgentOnboardingWizardEnabled && displayWelcomePage)
        return isWelcomeDynamic(welcomePageFeatureFlag, accountId)
            ? OnboardingState.WelcomeDynamic
            : OnboardingState.WelcomeStatic

    if (
        isAiAgentOnboardingWizardEnabled &&
        (!storeConfiguration || isOnUpdateOnboardingWizard)
    )
        return OnboardingState.OnboardingWizard

    return OnboardingState.Onboarded
}
