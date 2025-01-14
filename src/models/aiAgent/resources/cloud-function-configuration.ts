import axios from 'axios'

import {HelpCenter} from 'models/helpCenter/types'

import {isProduction, isStaging} from '../../../utils/environment'

import gorgiasAppsAuthInterceptor from '../../../utils/gorgiasAppsAuth'
import {
    AccountConfiguration,
    AccountConfigurationResponse,
    CreateOnboardingNotificationStatePayload,
    CreateStoreConfigurationPayload,
    GetStoreConfigurationParams,
    OnboardingNotificationStateResponse,
    StoreConfigurationResponse,
    UpsertOnboardingNotificationStatePayload,
    UpsertStoreConfigurationPayload,
    WelcomePageAcknowledgedResponse,
} from '../types'

/**
 * API Client for AI Agent
 */

const baseURL = isProduction()
    ? `https://ai-config.gorgias.help`
    : isStaging()
      ? 'https://ai-config.gorgias.rehab'
      : `http://localhost:8096`

// eslint-disable-next-line no-restricted-properties
export const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
})

apiClient.interceptors.request.use(gorgiasAppsAuthInterceptor)

/**
 * Endpoints "/accounts/<gorgiasDomain>"
 */

export const getAccountConfiguration = async (accountDomain: string) => {
    return await apiClient.get<AccountConfigurationResponse>(
        `/accounts/${accountDomain}`
    )
}

export const createAccountConfiguration = async (
    accountConfiguration: AccountConfiguration & {
        storeNames: string[]
        helpdeskOAuth: null
    }
) => {
    return await apiClient.post<AccountConfigurationResponse>(
        `/accounts`,
        accountConfiguration
    )
}

export async function upsertAccountConfiguration(
    accountConfiguration: AccountConfiguration
) {
    const accountDomain = accountConfiguration.gorgiasDomain

    return await apiClient.put<AccountConfigurationResponse>(
        `/accounts/${accountDomain}`,
        accountConfiguration
    )
}

/**
 * Endpoints "/accounts/<gorgiasDomain>/stores/<storeName>"
 */

export const getStoreConfiguration = async (
    params: GetStoreConfigurationParams
) => {
    const {accountDomain, storeName, withWizard} = params
    const queryParams = new URLSearchParams({with_wizard: String(!!withWizard)})

    return await apiClient.get<StoreConfigurationResponse>(
        `/accounts/${accountDomain}/stores/${storeName}?${queryParams.toString()}`
    )
}

export const createStoreConfiguration = async (
    accountDomain: string,
    storeConfiguration: CreateStoreConfigurationPayload
) => {
    return await apiClient.post<StoreConfigurationResponse>(
        `/accounts/${accountDomain}/stores`,
        storeConfiguration
    )
}

export const upsertStoreConfiguration = async (
    accountDomain: string,
    storeConfiguration: UpsertStoreConfigurationPayload
) => {
    const storeName = storeConfiguration.storeName

    return await apiClient.put<StoreConfigurationResponse>(
        `/accounts/${accountDomain}/stores/${storeName}`,
        storeConfiguration
    )
}

export const createStoreSnippetHelpCenter = async (
    accountDomain: string,
    storeName: string
) => {
    return await apiClient.post<HelpCenter | null>(
        `/accounts/${accountDomain}/stores/${storeName}/initialize-snippet`
    )
}

/**
 * Endpoints "/stores/<storeName>/welcome-page-acknowledged"
 */

// accountDomain is unused in this function but we keep it in the arguments list
// to be iso with the new implementation of getWelcomePageAcknowledged in `configuration.ts`
export const getWelcomePageAcknowledged = async (
    accountDomain: string,
    storeName: string
) => {
    return await apiClient.get<WelcomePageAcknowledgedResponse>(
        `/stores/${storeName}/welcome-page-acknowledged`
    )
}

export const createWelcomePageAcknowledged = async (
    accountDomain: string,
    storeName: string
) => {
    return await apiClient.post<WelcomePageAcknowledgedResponse>(
        `/stores/${storeName}/welcome-page-acknowledged`
    )
}

/**
 * Endpoints "/accounts/<gorgiasDomain>/stores/<storeName>/onboarding-notification"
 */

export const getOnboardingNotificationState = async (
    accountDomain: string,
    storeName: string | undefined
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
