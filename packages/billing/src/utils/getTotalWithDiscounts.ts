import type { ProductType, SelectedPlans } from '../types'

type CouponSummaryLike = {
    amount_off_in_cents: number | null
    percent_off: number | null
    products: ProductType[]
}

export const getTotalWithDiscounts = (
    selectedPlans: SelectedPlans,
    coupon: CouponSummaryLike | null,
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

    let amountEligibleForDiscount: number

    if (couponAppliesToAllProducts) {
        amountEligibleForDiscount = totalAmountAfterCancellations
    } else {
        amountEligibleForDiscount = planAmountList.reduce(
            (acc, [type, planAmount]) => {
                if (!couponAppliesToProduct(coupon, type)) {
                    return acc
                }

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

    discount = Math.min(amountEligibleForDiscount, discount)

    return {
        totalWithDiscounts: totalAmountAfterCancellations - discount,
        totalWithoutDiscounts: totalAmountAfterCancellations,
        discountAmount: discount,
    }
}

const couponAppliesToProduct = (
    coupon: CouponSummaryLike,
    productType: ProductType,
) => coupon.products?.includes(productType) ?? false
