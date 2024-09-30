import {RevenueAddonClient} from 'rest_api/revenue_addon_api/client'

import {SettingsParams, SettingRequest} from './types'

export const updateSettings = async (
    client: RevenueAddonClient | undefined,
    params: SettingsParams,
    data: SettingRequest
) => {
    if (!client) return null

    return await client.update_setting(params, data)
}

export const getSettingsList = async (
    client: RevenueAddonClient | undefined,
    params: SettingsParams
) => {
    if (!client) return null

    return await client.get_settings(params, undefined)
}
