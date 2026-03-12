import type { CouponSummary, ProductType } from 'models/billing/types'

import type { SelectedPlans } from '../types'

// Calculates the costs all of currently selected products, accounting for coupons.
export const getTotalWithDiscounts = (
    selectedPlans: SelectedPlans,
    coupon: CouponSummary | null,
    totalCancelledAmount: number = 0,
    cancelledProducts: ProductType[] = [],
) => {
    const planAmountList = Object.entries(selectedPlans)
        .filter(([, product]) => product.isSelected && !!product.plan?.amount)
        .map(
            ([type, product]) =>
                [type, product.plan?.amount ?? 0] as [ProductType, number],
        )

    const totalAmount = planAmountList.reduce(
        (acc, [, planAmount]) => acc + planAmount,
        0,
    )

    const totalAmountAfterCancellations = totalAmount - totalCancelledAmount

    if (!coupon) {
        return {
            totalWithDiscounts: totalAmountAfterCancellations,
            totalWithoutDiscounts: totalAmountAfterCancellations,
            discountAmount: 0,
        }
    }

    const couponAppliesToAllProducts = coupon.products.length === 0

    // Calculate the amount eligible for discount after subtracting cancelled products
    let amountEligibleForDiscount: number

    if (couponAppliesToAllProducts) {
        // If coupon applies to all products, subtract all cancellations
        amountEligibleForDiscount = totalAmountAfterCancellations
    } else {
        // If coupon applies to specific products, only include non-cancelled eligible products
        amountEligibleForDiscount = planAmountList.reduce(
            (acc, [type, planAmount]) => {
                if (!couponAppliesToProduct(coupon, type)) {
                    return acc
                }

                // If this product is cancelled, don't include it in eligible amount
                if (cancelledProducts.includes(type)) {
                    return acc
                }

                return acc + planAmount
            },
            0,
        )
    }

    let discount = 0

    if (coupon?.amount_off_in_cents) {
        discount = coupon.amount_off_in_cents
    }

    if (coupon?.percent_off) {
        const percentOff = coupon.percent_off / 100
        discount = amountEligibleForDiscount * percentOff
    }

    // Make sure the discount is not larger than the amount eligible for discount
    discount = Math.min(amountEligibleForDiscount, discount)

    return {
        totalWithDiscounts: totalAmountAfterCancellations - discount,
        totalWithoutDiscounts: totalAmountAfterCancellations,
        discountAmount: discount,
    }
}

const couponAppliesToProduct = (
    coupon: CouponSummary,
    productType: ProductType,
) => coupon.products?.includes(productType) ?? false
