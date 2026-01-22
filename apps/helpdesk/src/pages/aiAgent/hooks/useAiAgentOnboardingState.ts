import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { isWizardSetupCompleted } from '../utils/wizardSetupHelpers'
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
        !isWizardSetupCompleted(storeConfiguration)

    if (isStoreConfigurationLoading || isLoading) return OnboardingState.Loading

    if (!storeConfiguration || isOnUpdateOnboardingWizard)
        return OnboardingState.OnboardingWizard

    return OnboardingState.Onboarded
}
