import axios from 'axios'
import {isProduction, isStaging} from '../../utils/environment'

import {DEFAULT_STORE_CONFIGURATION} from '../../pages/automate/aiAgent/constants'
import {
    AccountConfiguration,
    GetAccountConfigurationResponse,
    GetStoreConfigurationParams,
    GetStoreConfigurationResponse,
    PutStoreConfigurationParams,
} from './types'

/**
 * Api Client for AI Agent
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
    const res = await aiAgentApiClient.get<GetAccountConfigurationResponse>(
        `/accounts/${accountDomain}`
    )
    return res
}

export const createAccountConfiguration = async (
    accountConfiguration: AccountConfiguration & {helpdeskOAuth: null}
) => {
    const res = await aiAgentApiClient.post<GetAccountConfigurationResponse>(
        `/accounts`,
        accountConfiguration
    )
    return res
}

export const getOrCreateAccountConfiguration = async (
    accountId: number,
    accountDomain: string
) => {
    try {
        return await getAccountConfiguration(accountDomain)
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error
        }
        if (error.response?.status !== 404) {
            throw error
        }

        return await createAccountConfiguration({
            accountId,
            gorgiasDomain: accountDomain,
            helpdeskOAuth: null,
        })
    }
}

export async function upsertAccountConfiguration(
    accountConfiguration: AccountConfiguration
) {
    const accountDomain = accountConfiguration.gorgiasDomain

    const response = await aiAgentApiClient.put(
        `/accounts/${accountDomain}`,
        accountConfiguration
    )
    return response
}

/**
 * Endpoints "/accounts/<gorgiasDomain>/stores/<storeName>"
 */

export const getStoreConfiguration = async (
    params: GetStoreConfigurationParams
) => {
    const {accountDomain, storeName} = params

    const res = await aiAgentApiClient.get<GetStoreConfigurationResponse>(
        `/accounts/${accountDomain}/stores/${storeName}`
    )
    return res
}

export async function upsertStoreConfiguration(
    params: PutStoreConfigurationParams
) {
    const {accountDomain, storeName, storeConfiguration} = params

    // FIXME: adding the response type, conversation api should return the updated store configuration
    const response = await aiAgentApiClient.put<GetStoreConfigurationResponse>(
        `/accounts/${accountDomain}/stores/${storeName}`,
        storeConfiguration
    )
    return response
}

export const getOrCreateStoreConfiguration = async (
    params: GetStoreConfigurationParams
) => {
    try {
        return await getStoreConfiguration(params)
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error
        }
        if (error.response?.status !== 404) {
            throw error
        }

        // FIXME: 1. Let the backend handle the default store configuration
        // FIXME: 2. Use a post request to create the store configuration when available
        return await upsertStoreConfiguration({
            storeConfiguration: DEFAULT_STORE_CONFIGURATION,
            accountDomain: params.accountDomain,
            storeName: params.storeName,
        })
    }
}
