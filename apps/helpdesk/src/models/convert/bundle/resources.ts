import { RevenueAddonClient } from 'rest_api/revenue_addon_api/client'

export const listBundles = async (client: RevenueAddonClient | undefined) => {
    if (!client) return null

    return await client.list_bundle_installation()
}
