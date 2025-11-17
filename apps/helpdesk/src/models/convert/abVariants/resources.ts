import type { RevenueAddonClient } from 'rest_api/revenue_addon_api/client'

import type { ABStopRequestPayload, ABVariantParams } from './types'

export const createABGroup = async (
    client: RevenueAddonClient | undefined,
    params: ABVariantParams,
) => {
    if (!client) return null

    return await client.create_ab_group(params, undefined)
}

export const startABGroup = async (
    client: RevenueAddonClient | undefined,
    params: ABVariantParams,
) => {
    if (!client) return null

    return await client.start_ab_group(params, undefined)
}

export const stopABGroup = async (
    client: RevenueAddonClient | undefined,
    params: ABVariantParams,
    data: ABStopRequestPayload,
) => {
    if (!client) return null

    return await client.stop_ab_group(params, data)
}

export const pauseABGroup = async (
    client: RevenueAddonClient | undefined,
    params: ABVariantParams,
) => {
    if (!client) return null

    return await client.pause_ab_group(params, undefined)
}
