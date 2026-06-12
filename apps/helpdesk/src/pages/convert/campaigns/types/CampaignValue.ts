import { isEqual } from '@gorgias/toolkit'

export type PurchasedProductValue = {
    productId: string
    productTitle: string
}

export function isPurchasedProductValue(
    value: PurchasedProductValue,
): value is PurchasedProductValue {
    return isEqual(Object.keys(value), ['productId', 'productTitle'])
}

export type CampaignValue =
    | string
    | string[]
    | number
    | boolean
    | PurchasedProductValue[]
