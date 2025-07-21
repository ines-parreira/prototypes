import { deepMapKeysToSnakeCase } from 'models/api/utils'
import {
    ChannelConnectionCreatePayload,
    ChannelConnectionListOptions,
    ChannelConnectionParams,
    ChannelConnectionUpdatePayload,
} from 'models/convert/channelConnection/types'
import { RevenueAddonClient } from 'rest_api/revenue_addon_api/client'

export const getChannelConnection = async (
    client: RevenueAddonClient | undefined,
    params: ChannelConnectionParams,
) => {
    if (!client) return null

    return await client.get_channel_connection(params)
}

export const listChannelConnections = async (
    client: RevenueAddonClient | undefined,
    options: ChannelConnectionListOptions = {},
) => {
    const parameters: Record<string, unknown> = deepMapKeysToSnakeCase(options)

    if (!client) return null

    return await client.get_channel_connections(parameters)
}

export const createChannelConnection = async (
    client: RevenueAddonClient | undefined,
    data: ChannelConnectionCreatePayload,
) => {
    if (!client) return null

    return await client.create_channel_connection(null, data)
}

export const updateChannelConnection = async (
    client: RevenueAddonClient | undefined,
    params: ChannelConnectionParams,
    data: ChannelConnectionUpdatePayload,
) => {
    if (!client) return null

    return await client.patch_channel_connection(params, data)
}

export const deleteChannelConnection = async (
    client: RevenueAddonClient | undefined,
    params: ChannelConnectionParams,
) => {
    if (!client) return null

    return await client.delete_channel_connection(params)
}
