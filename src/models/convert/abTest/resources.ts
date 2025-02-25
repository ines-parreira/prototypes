import { deepMapKeysToSnakeCase } from 'models/api/utils'
import { RevenueAddonClient } from 'rest_api/revenue_addon_api/client'

import {
    ABTestCreatePayload,
    ABTestListOptions,
    ABTestListParams,
    ABTestParams,
    ABTestUpdatePayload,
} from './types'

export const listABTests = async (
    client: RevenueAddonClient | undefined,
    options: ABTestListOptions,
) => {
    if (!client) return null

    // @ts-ignore Type instantiation is excessively deep and possibly infinite.
    const parameters: ABTestListParams = deepMapKeysToSnakeCase(options)
    return await client.get_ab_tests(parameters)
}

export const createABTest = async (
    client: RevenueAddonClient | undefined,
    data: ABTestCreatePayload,
) => {
    if (!client) return null

    return await client.create_ab_test(null, data)
}

export const updateABTest = async (
    client: RevenueAddonClient | undefined,
    params: ABTestParams,
    data: ABTestUpdatePayload,
) => {
    if (!client) return null

    return await client.patch_ab_test(params, data)
}
