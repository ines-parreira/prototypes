import axios from 'axios'
import {isProduction, isStaging} from '../../../utils/environment'

import {
    AccountConfiguration,
    GetAccountConfigurationResponse,
    GetStoreConfigurationParams,
    GetStoreConfigurationResponse,
    PutStoreConfigurationParams,
} from '../types'

/**
 * Api Client for AI Agent
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

/**
 * Endpoints "/accounts/<gorgiasDomain>"
 */

export const getAccountConfiguration = async (accountDomain: string) => {
    const res = await apiClient.get<GetAccountConfigurationResponse>(
        `/accounts/${accountDomain}`
    )
    return res
}

export const createAccountConfiguration = async (
    accountConfiguration: AccountConfiguration & {helpdeskOAuth: null}
) => {
    const res = await apiClient.post<GetAccountConfigurationResponse>(
        `/accounts`,
        accountConfiguration
    )
    return res
}

export async function upsertAccountConfiguration(
    accountConfiguration: AccountConfiguration
) {
    const accountDomain = accountConfiguration.gorgiasDomain

    const response = await apiClient.put(
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

    const res = await apiClient.get<GetStoreConfigurationResponse>(
        `/accounts/${accountDomain}/stores/${storeName}`
    )
    return res
}

export async function upsertStoreConfiguration(
    params: PutStoreConfigurationParams
) {
    const {accountDomain, storeName, storeConfiguration} = params

    // FIXME: adding the response type, conversation api should return the updated store configuration
    const response = await apiClient.put<GetStoreConfigurationResponse>(
        `/accounts/${accountDomain}/stores/${storeName}`,
        storeConfiguration
    )
    return response
}
