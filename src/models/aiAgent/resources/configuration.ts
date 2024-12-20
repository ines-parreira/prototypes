import axios from 'axios'

import {HelpCenter} from 'models/helpCenter/types'

import {isProduction, isStaging} from '../../../utils/environment'

import gorgiasAppsAuthInterceptor from '../../../utils/gorgiasAppsAuth'
import {
    AccountConfiguration,
    AccountConfigurationResponse,
    CreateStoreConfigurationPayload,
    GetStoreConfigurationParams,
    StoreConfigurationResponse,
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
        `/config/accounts/${accountDomain}/configuration`
    )
}

export const createAccountConfiguration = async (
    accountConfiguration: AccountConfiguration & {
        storeNames: string[]
        helpdeskOAuth: null
    }
) => {
    const accountDomain = accountConfiguration.gorgiasDomain

    return await apiClient.post<AccountConfigurationResponse>(
        `/config/accounts/${accountDomain}/configuration`,
        accountConfiguration
    )
}

export async function upsertAccountConfiguration(
    accountConfiguration: AccountConfiguration
) {
    const accountDomain = accountConfiguration.gorgiasDomain

    return await apiClient.put<AccountConfigurationResponse>(
        `/config/accounts/${accountDomain}/configuration`,
        accountConfiguration
    )
}

/**
 * Endpoints "/accounts/<gorgiasDomain>/stores/<storeName>/configuration"
 */

export const getStoreConfiguration = async (
    params: GetStoreConfigurationParams
) => {
    const {accountDomain, storeName, withWizard} = params
    const queryParams = new URLSearchParams({with_wizard: String(!!withWizard)})

    return await apiClient.get<StoreConfigurationResponse>(
        `/config/accounts/${accountDomain}/stores/${storeName}/configuration?${queryParams.toString()}`
    )
}

export const createStoreConfiguration = async (
    accountDomain: string,
    storeConfiguration: CreateStoreConfigurationPayload
) => {
    const storeName = storeConfiguration.storeName

    return await apiClient.post<StoreConfigurationResponse>(
        `/config/accounts/${accountDomain}/stores/${storeName}/configuration`,
        storeConfiguration
    )
}

export const upsertStoreConfiguration = async (
    accountDomain: string,
    storeConfiguration: UpsertStoreConfigurationPayload
) => {
    const storeName = storeConfiguration.storeName

    return await apiClient.put<StoreConfigurationResponse>(
        `/config/accounts/${accountDomain}/stores/${storeName}/configuration`,
        storeConfiguration
    )
}

export const createStoreSnippetHelpCenter = async (
    accountDomain: string,
    storeName: string
) => {
    return await apiClient.post<HelpCenter | null>(
        `/config/accounts/${accountDomain}/stores/${storeName}/snippet`
    )
}

/**
 * Endpoints "/accounts/<accountDomain>/stores/<storeName>/welcome-page"
 */
export const getWelcomePageAcknowledged = async (
    accountDomain: string,
    storeName: string
) => {
    return await apiClient.get<WelcomePageAcknowledgedResponse>(
        `/config/accounts/${accountDomain}/stores/${storeName}/welcome-page`
    )
}

export const createWelcomePageAcknowledged = async (
    accountDomain: string,
    storeName: string
) => {
    return await apiClient.post<WelcomePageAcknowledgedResponse>(
        `/config/accounts/${accountDomain}/stores/${storeName}/welcome-page`
    )
}
