import {CouponSummary, ProductType} from 'models/billing/types'

import {SelectedPlans} from '../views/BillingProcessView/BillingProcessView'

// Calculates the costs all of currently selected products, accounting for coupons.
export const getTotalWithDiscounts = (
    selectedPlans: SelectedPlans,
    coupon: CouponSummary | null
) => {
    const planAmountList = Object.entries(selectedPlans)
        .filter(([, product]) => product.isSelected && !!product.plan?.amount)
        .map(
            ([type, product]) =>
                [type, product.plan?.amount ?? 0] as [ProductType, number]
        )

    const totalAmount = planAmountList.reduce(
        (acc, [, planAmount]) => acc + planAmount,
        0
    )

    if (!coupon) {
        return {
            totalWithDiscounts: totalAmount,
            totalWithoutDiscounts: totalAmount,
            discountAmount: 0,
        }
    }

    const couponAppliesToAllProducts = coupon.products.length === 0

    // If the coupon applies to all products, we can just use the total amount
    const amountEligibleForDiscount = couponAppliesToAllProducts
        ? totalAmount
        : planAmountList.reduce(
              (acc, [type, planAmount]) =>
                  acc + (couponAppliesToProduct(coupon, type) ? planAmount : 0),
              0
          )

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
        totalWithDiscounts: totalAmount - discount,
        totalWithoutDiscounts: totalAmount,
        discountAmount: discount,
    }
}

const couponAppliesToProduct = (
    coupon: CouponSummary,
    productType: ProductType
) => coupon.products?.includes(productType) ?? false
