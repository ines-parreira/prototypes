import type { RevenueAddonClient } from 'rest_api/revenue_addon_api/client'

import type {
    UniqueDiscountListParams,
    UniqueDiscountOfferCreatePayload,
    UniqueDiscountOfferDeleteParams,
    UniqueDiscountOfferGetParams,
    UniqueDiscountOfferPatchParams,
    UniqueDiscountOfferPatchPayload,
} from './types'

export const getDiscountOffers = async (
    client: RevenueAddonClient | undefined,
    params: UniqueDiscountListParams,
) => {
    if (!client) return null

    return await client.get_discount_offers(params)
}

export const createDiscountOffer = async (
    client: RevenueAddonClient | undefined,
    data: UniqueDiscountOfferCreatePayload,
) => {
    if (!client) return null

    return await client.create_discount_offer(null, data)
}

export const updateDiscountOffer = async (
    client: RevenueAddonClient | undefined,
    params: UniqueDiscountOfferPatchParams,
    data: UniqueDiscountOfferPatchPayload,
) => {
    if (!client) return null

    return await client.patch_discount_offer(params, data)
}

export const deleteDiscountOffer = async (
    client: RevenueAddonClient | undefined,
    params: UniqueDiscountOfferDeleteParams,
) => {
    if (!client) return null

    return await client.delete_discount_offer(params)
}

export const getDiscountOffer = async (
    client: RevenueAddonClient | undefined,
    params: UniqueDiscountOfferGetParams,
) => {
    if (!client) return null

    return await client.get_discount_offer(params)
}
