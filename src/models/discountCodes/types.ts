import { UniqueDiscountOffer } from 'models/convert/discountOffer/types'

export type DiscountCode = {
    id: number
    title: string
    summary: string
    code: string
    shareable_url: string
}

export const discountCodeIsGeneric = (
    discount: DiscountCode | UniqueDiscountOffer,
): discount is DiscountCode => {
    return !!(discount as DiscountCode)?.code
}
export const discountCodeIsUnique = (
    discount: DiscountCode | UniqueDiscountOffer,
): discount is UniqueDiscountOffer => {
    return !!(discount as UniqueDiscountOffer)?.prefix
}
