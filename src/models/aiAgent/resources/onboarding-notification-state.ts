import {
    CreateOnboardingNotificationStatePayload,
    OnboardingNotificationStateResponse,
    UpsertOnboardingNotificationStatePayload,
} from '../types'
import {apiClient} from './cloud-function-configuration'

/**
 * Endpoints "/accounts/<gorgiasDomain>/stores/<storeName>/onboarding-notification"
 */

export const getOnboardingNotificationState = async (
    accountDomain: string,
    storeName: string
) => {
    return await apiClient.get<OnboardingNotificationStateResponse>(
        `/accounts/${accountDomain}/stores/${storeName}/onboarding-notification`
    )
}

export const createOnboardingNotificationState = async (
    accountDomain: string,
    storeName: string,
    onboardingNotificationState: CreateOnboardingNotificationStatePayload
) => {
    return await apiClient.post<OnboardingNotificationStateResponse>(
        `/accounts/${accountDomain}/stores/${storeName}/onboarding-notification`,
        onboardingNotificationState
    )
}

export const upsertOnboardingNotificationState = async (
    accountDomain: string,
    storeName: string,
    onboardingNotificationState: UpsertOnboardingNotificationStatePayload
) => {
    return await apiClient.put<OnboardingNotificationStateResponse>(
        `/accounts/${accountDomain}/stores/${storeName}/onboarding-notification`,
        onboardingNotificationState
    )
}
