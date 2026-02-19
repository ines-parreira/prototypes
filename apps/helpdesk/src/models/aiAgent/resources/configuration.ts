import { isProduction, isStaging } from '@repo/utils'
import type { AxiosError } from 'axios'
import axios from 'axios'

import type { HelpCenter } from 'models/helpCenter/types'
import type { AiAgentChannel } from 'pages/aiAgent/constants'

import gorgiasAppsAuthInterceptor from '../../../utils/gorgiasAppsAuth'
import type {
    AccountConfiguration,
    AccountConfigurationResponse,
    CreateOnboardingNotificationStatePayload,
    CreateStoreConfigurationPayload,
    GetStoreConfigurationParams,
    HandoverConfigurationData,
    HandoverConfigurationResponse,
    OnboardingData,
    OnboardingNotificationStateResponse,
    ResponseTrial,
    StoreConfigurationResponse,
    StoreConfigurationsResponse,
    UpsertOnboardingNotificationStatePayload,
    UpsertStoreConfigurationPayload,
    WelcomePageAcknowledgedResponse,
} from '../types'

/**
 * API Client for AI Agent
 */

const domain = isProduction()
    ? `https://aiagent.gorgias.help`
    : isStaging()
      ? 'https://aiagent.gorgias.rehab'
      : `http://localhost:9402`

const baseURL = `${domain}/api`

// eslint-disable-next-line no-restricted-properties
export const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
})

apiClient.interceptors.request.use(gorgiasAppsAuthInterceptor)

/**
 * Endpoints "/accounts/<gorgiasDomain>/configuration"
 */

export const getAccountConfiguration = async (accountDomain: string) => {
    return await apiClient.get<AccountConfigurationResponse>(
        `/config/accounts/${accountDomain}/configuration`,
    )
}

export const createAccountConfiguration = async (
    accountConfiguration: AccountConfiguration & {
        storeNames: string[]
        helpdeskOAuth: null
    },
) => {
    const accountDomain = accountConfiguration.gorgiasDomain

    return await apiClient.post<AccountConfigurationResponse>(
        `/config/accounts/${accountDomain}/configuration`,
        accountConfiguration,
    )
}

export async function upsertAccountConfiguration(
    accountConfiguration: AccountConfiguration,
) {
    const accountDomain = accountConfiguration.gorgiasDomain

    return await apiClient.put<AccountConfigurationResponse>(
        `/config/accounts/${accountDomain}/configuration`,
        accountConfiguration,
    )
}

/**
 * Endpoints "/accounts/<gorgiasDomain>/stores/configurations"
 */
export const getStoresConfigurations = async (
    accountDomain: string,
    params: {
        withWizard: boolean
        withFloatingInput: boolean
    },
) => {
    const { withWizard, withFloatingInput } = params
    const queryParams = new URLSearchParams({
        ...(withWizard && { with_wizard: 'true' }),
        ...(withFloatingInput && {
            with_floating_chat_input_configuration: 'true',
        }),
    })

    try {
        const res = await apiClient.get<StoreConfigurationsResponse>(
            `/config/accounts/${accountDomain}/stores/configurations?${queryParams.toString()}`,
        )
        return res.data
    } catch (e) {
        const status = (e as AxiosError)?.response?.status
        if (status === 404 || status === 403) {
            console.warn(
                `[getStoresConfigurations] ${status} for ${accountDomain} — returning fallback`,
            )
            return { storeConfigurations: [] }
        }
        throw e
    }
}

/**
 * Endpoints "/accounts/<gorgiasDomain>/stores/<storeName>/configuration"
 */

export const getStoreConfiguration = async (
    params: GetStoreConfigurationParams,
) => {
    const {
        accountDomain,
        storeName,
        withWizard,
        withFloatingInput = false,
    } = params
    const queryParams = new URLSearchParams({
        with_wizard: String(!!withWizard),
        ...(withFloatingInput && {
            with_floating_chat_input_configuration: 'true',
        }),
    })

    return await apiClient.get<StoreConfigurationResponse>(
        `/config/accounts/${accountDomain}/stores/${storeName}/configuration?${queryParams.toString()}`,
    )
}

export const createStoreConfiguration = async (
    accountDomain: string,
    storeConfiguration: CreateStoreConfigurationPayload,
) => {
    const storeName = storeConfiguration.storeName

    return await apiClient.post<StoreConfigurationResponse>(
        `/config/accounts/${accountDomain}/stores/${storeName}/configuration`,
        storeConfiguration,
    )
}

export const upsertStoreConfiguration = async (
    accountDomain: string,
    storeConfiguration: UpsertStoreConfigurationPayload,
) => {
    const storeName = storeConfiguration.storeName
    return await apiClient.put<StoreConfigurationResponse>(
        `/config/accounts/${accountDomain}/stores/${storeName}/configuration`,
        storeConfiguration,
    )
}

/**
 * Batch the upsert of store configurations.
 * We must create a new function instead of reusing upsertStoreConfiguration to:
 * - ensure typing using MutationOverrides is working,
 * - allow to run all promise sequentially (no awaiting the PUT request).
 */
export const upsertStoresConfiguration = async (
    accountDomain: string,
    storeConfigurations: UpsertStoreConfigurationPayload[],
) => {
    const pendingPromises = storeConfigurations.map((storeConfiguration) => {
        const storeName = storeConfiguration.storeName
        return apiClient.put<StoreConfigurationResponse>(
            `/config/accounts/${accountDomain}/stores/${storeName}/configuration`,
            storeConfiguration,
        )
    })
    return await Promise.all(pendingPromises)
}

export const createStoreSnippetHelpCenter = async (
    accountDomain: string,
    storeName: string,
) => {
    return await apiClient.post<HelpCenter | null>(
        `/config/accounts/${accountDomain}/stores/${storeName}/snippet`,
    )
}

/**
 * Endpoints "/accounts/<accountDomain>/stores/<storeName>/welcome-page"
 */
export const getWelcomePageAcknowledged = async (
    accountDomain: string,
    storeName: string,
) => {
    return await apiClient.get<WelcomePageAcknowledgedResponse>(
        `/config/accounts/${accountDomain}/stores/${storeName}/welcome-page`,
    )
}

export const createWelcomePageAcknowledged = async (
    accountDomain: string,
    storeName: string,
) => {
    return await apiClient.post<WelcomePageAcknowledgedResponse>(
        `/config/accounts/${accountDomain}/stores/${storeName}/welcome-page`,
    )
}

/**
 * Endpoints "/accounts/<gorgiasDomain>/stores/<storeName>/onboarding-notification"
 */

export const getOnboardingNotificationState = async (
    accountDomain: string,
    storeName: string | undefined,
) => {
    return await apiClient.get<OnboardingNotificationStateResponse>(
        `/config/accounts/${accountDomain}/stores/${storeName}/onboarding-notification`,
    )
}

export const createOnboardingNotificationState = async (
    accountDomain: string,
    storeName: string,
    onboardingNotificationState: CreateOnboardingNotificationStatePayload,
) => {
    return await apiClient.post<OnboardingNotificationStateResponse>(
        `/config/accounts/${accountDomain}/stores/${storeName}/onboarding-notification`,
        onboardingNotificationState,
    )
}

export const upsertOnboardingNotificationState = async (
    accountDomain: string,
    storeName: string,
    onboardingNotificationState: UpsertOnboardingNotificationStatePayload,
) => {
    return await apiClient.put<OnboardingNotificationStateResponse>(
        `/config/accounts/${accountDomain}/stores/${storeName}/onboarding-notification`,
        onboardingNotificationState,
    )
}

/**
 * Endpoints "/api/onboardings"
 */
export const getOnboardingData = async (): Promise<OnboardingData[]> => {
    const { data } = await apiClient.get<OnboardingData[]>('/onboardings')
    return data
}

export const getOnboardingDataByShopName = async (
    shopName: string,
): Promise<OnboardingData[]> => {
    const { data } = await apiClient.get<OnboardingData[]>('/onboardings', {
        params: { shop_name: shopName },
    })
    return data
}

export const createOnboardingData = async (
    data: Partial<OnboardingData>,
): Promise<OnboardingData> => {
    const response = await apiClient.post<OnboardingData>('/onboardings', data)
    return response.data
}

export const updateOnboardingData = async (
    id: string | number,
    updateData: Partial<OnboardingData>,
): Promise<OnboardingData> => {
    const response = await apiClient.put<OnboardingData>(
        `/onboardings/${id}`,
        updateData,
    )
    return response.data
}

/**
 * AI Agent Trial endpoints
 */
export const getTrials = async (gorgiasDomain: string) => {
    const response = await apiClient.get<ResponseTrial[]>(
        `/config/accounts/${gorgiasDomain}/stores/trials`,
    )
    return response.data
}

export const startAiAgentTrial = async (
    gorgiasDomain: string,
    storeType: string,
    storeName: string,
    optedInForUpgrade: boolean = false,
) => {
    const response = await apiClient.post(
        `/config/accounts/${gorgiasDomain}/stores/${storeType}/${storeName}/start-trial`,
        {
            optedInForUpgrade,
        },
    )
    return response.data
}

export const optOutAiAgentTrialUpgrade = async (gorgiasDomain: string) => {
    const response = await apiClient.post(
        `/config/accounts/${gorgiasDomain}/opt-out-trial-upgrade`,
    )
    return response.data
}

/**
 * Endpoints "/accounts/<gorgiasDomain>/stores/<storeName>/handover-configurations"
 */

export const getAiAgentStoreHandoverConfigurations = async (
    accountDomain: string,
    storeName: string,
    channel?: AiAgentChannel,
) => {
    const queryParams = new URLSearchParams()

    if (channel) {
        queryParams.set('channel', channel)
    }

    let url = `/config/accounts/${accountDomain}/stores/${storeName}/handover-configurations`

    if (queryParams.toString()) {
        url += `?${queryParams.toString()}`
    }

    const response = await apiClient.get<HandoverConfigurationResponse>(url)

    return response.data
}

export const upsertAiAgentStoreHandoverConfiguration = async (
    accountDomain: string,
    storeName: string,
    integrationId: number,
    data: HandoverConfigurationData,
) => {
    const response = await apiClient.put<HandoverConfigurationData>(
        `/config/accounts/${accountDomain}/stores/${storeName}/handover-configurations/${integrationId}`,
        data,
    )

    return response.data
}

/**
 * Sales endpoints
 */

export const startSalesTrial = async (
    gorgiasDomain: string,
    storeType: string,
    storeName: string,
) => {
    const response = await apiClient.post(
        `/config/accounts/${gorgiasDomain}/sales/${storeType}/${storeName}/start-trial`,
        { optedInForUpgrade: true },
    )
    return response.data
}

export const optOutSalesTrialUpgrade = async (gorgiasDomain: string) => {
    const response = await apiClient.post(
        `/config/accounts/${gorgiasDomain}/sales/opt-out-trial-upgrade`,
    )
    return response.data
}
