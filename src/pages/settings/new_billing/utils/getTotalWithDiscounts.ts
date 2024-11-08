import {CouponSummary, ProductType} from 'models/billing/types'

import {SelectedPlans} from '../views/BillingProcessView/BillingProcessView'

function getDiscountAmount(baseAmount: number, coupon: CouponSummary): number {
    let discountAmount = 0
    if (coupon.percent_off !== null) {
        discountAmount = baseAmount * (coupon.percent_off / 100)
    } else if (coupon.amount_off_in_cents !== null) {
        discountAmount = coupon.amount_off_in_cents
    }

    // we don't want to have our rebate be larger than the cost of the plan, the max discount is 100%
    return Math.min(baseAmount, discountAmount)
}

// Calculates the costs all of currently selected products, accounting for coupons.
export const getTotalWithDiscounts = (
    selectedPlans: SelectedPlans,
    coupon: CouponSummary | null
) => {
    let totalWithoutDiscounts = 0
    let discountAmount = 0

    Object.entries(selectedPlans)
        .filter(([, product]) => product.isSelected && !!product.plan?.amount)
        .map(
            ([type, product]) =>
                [type, product.plan?.amount ?? 0] as [ProductType, number]
        )
        .forEach(([type, planAmount]) => {
            totalWithoutDiscounts += planAmount

            if (!coupon) return

            if (couponAppliesToProduct(coupon, type)) {
                discountAmount += getDiscountAmount(planAmount, coupon)
            }
        })

    if (coupon?.products?.length === 0) {
        discountAmount = getDiscountAmount(totalWithoutDiscounts, coupon)
    }

    const totalWithDiscounts = totalWithoutDiscounts - discountAmount
    return {totalWithDiscounts, totalWithoutDiscounts, discountAmount}
}

const couponAppliesToProduct = (
    coupon: CouponSummary,
    productType: ProductType
) => coupon.products?.includes(productType) ?? false
