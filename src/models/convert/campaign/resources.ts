import {RevenueAddonClient} from 'rest_api/revenue_addon_api/client'
import {deepMapKeysToSnakeCase} from 'models/api/utils'
import {
    CampaignCreatePayload,
    CampaignListOptions,
    CampaignListParams,
    CampaignParams,
    CampaignUpdatePayload,
} from './types'

export const getCampaign = async (
    client: RevenueAddonClient | undefined,
    params: CampaignParams
) => {
    if (!client) return null

    return await client.get_campaign(params)
}

export const listCampaigns = async (
    client: RevenueAddonClient | undefined,
    options: CampaignListOptions
) => {
    if (!client) return null

    // @ts-ignore Type instantiation is excessively deep and possibly infinite.
    const parameters: CampaignListParams = deepMapKeysToSnakeCase(options)
    return await client.get_campaigns(parameters)
}

export const createCampaign = async (
    client: RevenueAddonClient | undefined,
    data: CampaignCreatePayload
) => {
    if (!client) return null

    return await client.create_campaign(null, data)
}

export const updateCampaign = async (
    client: RevenueAddonClient | undefined,
    params: CampaignParams,
    data: CampaignUpdatePayload
) => {
    if (!client) return null

    return await client.patch_campaign(params, data)
}

export const deleteCampaign = async (
    client: RevenueAddonClient | undefined,
    params: CampaignParams
) => {
    if (!client) return null

    return await client.delete_campaign(params)
}
