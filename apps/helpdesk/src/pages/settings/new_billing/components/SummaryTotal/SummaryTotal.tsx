import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import type { CouponSummary, Plan, ProductType } from 'models/billing/types'
import { Cadence, SubscriptionStatus } from 'models/billing/types'
import { useBillingStateWithSideEffects } from 'pages/settings/new_billing/hooks/useBillingStateWithSideEffects'

import type { SelectedPlans } from '../../types'
import { formatAmount } from '../../utils/formatAmount'
import { getTotalWithDiscounts } from '../../utils/getTotalWithDiscounts'
import SummaryTotalWithDiscounts from './SummaryTotalWithDiscounts'

import css from './SummaryTotal.less'

export type SummaryTotalProps = {
    selectedPlans: SelectedPlans
    totalProductAmount: number
    prices?: Plan[]
    cadence?: Cadence
    currency: string
    isFrequencyChanged?: boolean
    totalCancelledAmount?: number
    cancelledProducts?: ProductType[]
}

const SummaryTotal = ({
    selectedPlans,
    totalProductAmount,
    cadence = Cadence.Month,
    currency,
    isFrequencyChanged = false,
    totalCancelledAmount = 0,
    cancelledProducts = [],
}: SummaryTotalProps) => {
    // Get the total amount of the selected plans
    const amountSelectedPlans = useMemo(() => {
        return Object.values(selectedPlans).reduce((acc, plan) => {
            if (plan.isSelected) {
                return acc + (plan.plan?.amount ?? 0)
            }
            return acc
        }, 0)
    }, [selectedPlans])

    const oldPlanPrice = useMemo(() => {
        if (totalProductAmount === amountSelectedPlans) {
            return null
        }
        return totalProductAmount
    }, [totalProductAmount, amountSelectedPlans])

    const {
        totalWithDiscounts,
        totalWithoutDiscounts,
        discountAmount,
        showDiscountedPrice,
    } = usePriceSummary(selectedPlans, totalCancelledAmount, cancelledProducts)

    return (
        <div className={css.container}>
            {showDiscountedPrice ? (
                <SummaryTotalWithDiscounts
                    totalWithDiscounts={totalWithDiscounts}
                    totalWithoutDiscounts={totalWithoutDiscounts}
                    discountAmount={discountAmount}
                    currency={currency}
                    cadence={cadence}
                ></SummaryTotalWithDiscounts>
            ) : (
                <div className={css.total}>
                    <div className={css.totalTitle}>Total</div>
                    <div className={css.totalPrice}>
                        {!!oldPlanPrice && !isFrequencyChanged && (
                            <div
                                className={css.oldPrice}
                                aria-label="Old price"
                            >
                                {formatAmount(
                                    (oldPlanPrice - totalCancelledAmount) / 100,
                                    currency,
                                )}
                            </div>
                        )}
                        <span aria-label="Total price">
                            {formatAmount(
                                (amountSelectedPlans - totalCancelledAmount) /
                                    100,
                                currency,
                            )}
                        </span>
                        /{cadence}
                    </div>
                </div>
            )}
            <div className={css.disclaimer}>Prices exclusive of sales tax</div>
        </div>
    )
}

function usePriceSummary(
    selectedPlans: SelectedPlans,
    totalCancelledAmount: number,
    cancelledProducts: ProductType[],
) {
    const billingSummaryTotalWithCouponsEnabled = useFlag(
        FeatureFlagKey.BillingSummaryTotalWithCoupons,
    )

    const { data: billingState } = useBillingStateWithSideEffects()
    const coupon: CouponSummary | null =
        billingState?.subscription?.status === SubscriptionStatus.CANCELED
            ? billingState?.customer?.coupon || null
            : billingState?.subscription?.coupon ||
              billingState?.customer?.coupon ||
              null

    const { totalWithDiscounts, totalWithoutDiscounts, discountAmount } =
        useMemo(
            () =>
                getTotalWithDiscounts(
                    selectedPlans,
                    coupon,
                    totalCancelledAmount,
                    cancelledProducts,
                ),
            [coupon, selectedPlans, totalCancelledAmount, cancelledProducts],
        )
    const showDiscountedPrice =
        billingSummaryTotalWithCouponsEnabled && discountAmount > 0

    return {
        totalWithDiscounts,
        totalWithoutDiscounts,
        discountAmount,
        showDiscountedPrice,
    }
}

export default SummaryTotal
