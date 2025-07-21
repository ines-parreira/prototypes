import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { useStoreConfiguration } from './useStoreConfiguration'

export enum OnboardingState {
    Loading = 'loading',
    OnboardingWizard = 'onboardingWizard',
    Onboarded = 'onboarded',
}

export const useAiAgentOnboardingState = (
    shopName: string,
    isLoading?: boolean,
): OnboardingState => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const { isLoading: isStoreConfigurationLoading, storeConfiguration } =
        useStoreConfiguration({
            shopName,
            accountDomain,
        })

    const isOnUpdateOnboardingWizard =
        storeConfiguration?.wizard?.completedDatetime === null

    if (isStoreConfigurationLoading || isLoading) return OnboardingState.Loading

    if (!storeConfiguration || isOnUpdateOnboardingWizard)
        return OnboardingState.OnboardingWizard

    return OnboardingState.Onboarded
}
