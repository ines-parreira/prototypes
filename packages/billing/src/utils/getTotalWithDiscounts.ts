import type { DiscountVO } from '@gorgias/helpdesk-types'

import type { ProductType, SelectedPlans } from '../types'

export const getTotalWithDiscounts = (
    selectedPlans: SelectedPlans,
    discounts: DiscountVO[],
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

    if (!discounts.length) {
        return {
            totalWithDiscounts: totalAmountAfterCancellations,
            totalWithoutDiscounts: totalAmountAfterCancellations,
            discountAmount: 0,
        }
    }

    const sortedDiscounts = [...discounts].sort((a, b) => {
        if (a.discount_applicability !== b.discount_applicability) {
            return a.discount_applicability - b.discount_applicability
        }
        if (a.discount_type !== b.discount_type) {
            // SDK types discount_type as a string enum but the API returns 1 (flat) or 2 (percentage).
            // TODO: remove the cast once the SDK is updated.
            return (
                (a.discount_type as unknown as number) -
                (b.discount_type as unknown as number)
            )
        }
        return a.discount_object_type - b.discount_object_type
    })

    // Exclude cancelled products upfront so their amounts never count toward
    // discount eligibility, and sum(remainingByProduct) === totalAmountAfterCancellations.
    // Keyed as string to avoid a TypeScript incompatibility between the local ProductType
    // enum and the SDK's const-based ProductType used in DiscountVO.products.
    const remainingByProduct = new Map<string, number>(
        planAmountList.filter(([type]) => !cancelledProducts.includes(type)),
    )

    let totalDiscountAmount = 0

    for (const discount of sortedDiscounts) {
        const appliesToAllProducts = discount.products.length === 0

        const eligibleAmount = appliesToAllProducts
            ? Array.from(remainingByProduct.values()).reduce(
                  (acc, amount) => acc + amount,
                  0,
              )
            : discount.products.reduce(
                  (acc, type) => acc + (remainingByProduct.get(type) ?? 0),
                  0,
              )

        let discountAmount = 0
        if (discount.amount_off_in_cents) {
            discountAmount = discount.amount_off_in_cents
        } else if (discount.percent_off) {
            discountAmount = eligibleAmount * (discount.percent_off / 100)
        }
        discountAmount = Math.min(eligibleAmount, discountAmount)

        if (discountAmount > 0 && eligibleAmount > 0) {
            const ratio = discountAmount / eligibleAmount
            const productTypes = appliesToAllProducts
                ? Array.from(remainingByProduct.keys())
                : discount.products.filter((type: string) =>
                      remainingByProduct.has(type),
                  )

            for (const type of productTypes) {
                const current = remainingByProduct.get(type) ?? 0
                remainingByProduct.set(type, current * (1 - ratio))
            }
        }

        totalDiscountAmount += discountAmount
    }

    return {
        totalWithDiscounts: totalAmountAfterCancellations - totalDiscountAmount,
        totalWithoutDiscounts: totalAmountAfterCancellations,
        discountAmount: totalDiscountAmount,
    }
}
