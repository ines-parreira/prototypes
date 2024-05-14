import axios from 'axios'
import {isProduction, isStaging} from '../../../utils/environment'

import {
    AccountConfiguration,
    AccountConfigurationResponse,
    CreateStoreConfigurationPayload,
    GetStoreConfigurationParams,
    StoreConfigurationResponse,
    UpsertStoreConfigurationPayload,
} from '../types'
import gorgiasAppsAuthInterceptor from '../../../utils/gorgiasAppsAuth'

/**
 * API Client for AI Agent
 */

const baseURL = isProduction()
    ? `https://ai-config.gorgias.help`
    : isStaging()
    ? 'https://ai-config.gorgias.rehab'
    : `http://localhost:8096`

// eslint-disable-next-line no-restricted-properties
const apiClient = axios.create({
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
    const {accountDomain, storeName} = params

    return await apiClient.get<StoreConfigurationResponse>(
        `/accounts/${accountDomain}/stores/${storeName}`
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
