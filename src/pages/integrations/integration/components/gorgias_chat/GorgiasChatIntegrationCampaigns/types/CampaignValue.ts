import _isEqual from 'lodash/isEqual'

export type PurchasedProductValue = {
    productId: string
    productTitle: string
}

export function isPurchasedProductValue(
    value: CampaignValue | PurchasedProductValue
): value is PurchasedProductValue {
    return _isEqual(Object.keys(value), ['productId', 'productTitle'])
}

export type CampaignValue = string | number | boolean | PurchasedProductValue[]
