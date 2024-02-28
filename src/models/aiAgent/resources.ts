import axios from 'axios'
import {isProduction, isStaging} from '../../utils/environment'

import {
    GetAccountConfigurationParams,
    GetAccountConfigurationResponse,
    GetStoreConfigurationParams,
    GetStoreConfigurationResponse,
    PutAccountConfigurationParams,
    PutStoreConfigurationParams,
} from './types'

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

    const response = await aiAgentApiClient.put(
        `/accounts/${accountDomain}/stores/${storeName}`,
        storeConfiguration
    )
    return response
}

export const getAccountConfiguration = async (
    params: GetAccountConfigurationParams
) => {
    const {accountDomain} = params

    const res = await aiAgentApiClient.get<GetAccountConfigurationResponse>(
        `/accounts/${accountDomain}`
    )
    return res
}

export async function upsertAccountConfiguration(
    params: PutAccountConfigurationParams
) {
    const {accountDomain, accountConfiguration} = params

    const response = await aiAgentApiClient.put(
        `/accounts/${accountDomain}`,
        accountConfiguration
    )
    return response
}
