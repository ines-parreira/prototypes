import {RevenueAddonClient} from 'rest_api/revenue_addon_api/client'
import {Paths} from 'rest_api/revenue_addon_api/client.generated'

export const getDiscountOffers = async (
    client: RevenueAddonClient | undefined,
    params: Paths.GetDiscountOffers.QueryParameters
) => {
    if (!client) return null

    return await client.get_discount_offers(params)
}
