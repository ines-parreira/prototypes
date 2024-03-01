import axios from 'axios'
import {isProduction, isStaging} from '../../utils/environment'

import {
    AccountConfiguration,
    GetAccountConfigurationResponse,
    GetStoreConfigurationParams,
    GetStoreConfigurationResponse,
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

export const getAccountConfiguration = async (accountDomain: string) => {
    const res = await aiAgentApiClient.get<GetAccountConfigurationResponse>(
        `/accounts/${accountDomain}`
    )
    return res
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
