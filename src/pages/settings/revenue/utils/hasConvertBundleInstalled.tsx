import {getRevenueAddonApiClient} from 'rest_api/revenue_addon_api/client'

export const hasConvertBundleInstalled = async (): Promise<boolean> => {
    const client = await getRevenueAddonApiClient()
    const {data: bundleList} = await client.list_bundle_installation()
    return bundleList.length > 0
}
