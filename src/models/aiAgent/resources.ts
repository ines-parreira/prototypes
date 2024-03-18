import axios from 'axios'
import {isProduction, isStaging} from '../../utils/environment'

import {
    AccountConfiguration,
    AccountConfigurationResponse,
    GetStoreConfigurationParams,
    StoreConfiguration,
    StoreConfigurationResponse,
} from './types'

/**
 * API Client for AI Agent
 */

const baseURL = isProduction()
    ? `https://ai-config.gorgias.help`
    : isStaging()
    ? 'https://ai-config.gorgias.rehab'
    : `http://localhost:8096`

// eslint-disable-next-line no-restricted-properties
const aiAgentApiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
})

/**
 * Endpoints "/accounts/<gorgiasDomain>"
 */

export const getAccountConfiguration = async (accountDomain: string) => {
    return await aiAgentApiClient.get<AccountConfigurationResponse>(
        `/accounts/${accountDomain}`
    )
}

export const createAccountConfiguration = async (
    accountConfiguration: AccountConfiguration & {helpdeskOAuth: null}
) => {
    return await aiAgentApiClient.post<AccountConfigurationResponse>(
        `/accounts`,
        accountConfiguration
    )
}

export async function upsertAccountConfiguration(
    accountConfiguration: AccountConfiguration
) {
    const accountDomain = accountConfiguration.gorgiasDomain

    return await aiAgentApiClient.put<AccountConfigurationResponse>(
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

    return await aiAgentApiClient.get<StoreConfigurationResponse>(
        `/accounts/${accountDomain}/stores/${storeName}`
    )
}

export const createStoreConfiguration = async (
    accountDomain: string,
    storeConfiguration: Partial<StoreConfiguration>
) => {
    return await aiAgentApiClient.post<StoreConfigurationResponse>(
        `/accounts/${accountDomain}/stores`,
        storeConfiguration
    )
}

export const upsertStoreConfiguration = async (
    accountDomain: string,
    storeConfiguration: StoreConfiguration
) => {
    const storeName = storeConfiguration.storeName

    return await aiAgentApiClient.put<StoreConfigurationResponse>(
        `/accounts/${accountDomain}/stores/${storeName}`,
        storeConfiguration
    )
}
