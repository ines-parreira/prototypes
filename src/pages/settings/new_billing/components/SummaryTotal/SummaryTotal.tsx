import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useMemo} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {useBillingState} from 'models/billing/queries'
import {CouponSummary, Plan, PlanInterval} from 'models/billing/types'

import {formatAmount} from '../../utils/formatAmount'
import {getTotalWithDiscounts} from '../../utils/getTotalWithDiscounts'
import {SelectedPlans} from '../../views/BillingProcessView/BillingProcessView'

import css from './SummaryTotal.less'
import SummaryTotalWithDiscounts from './SummaryTotalWithDiscounts'

export type SummaryTotalProps = {
    selectedPlans: SelectedPlans
    totalProductAmount: number
    prices?: Plan[]
    interval?: PlanInterval
    currency: string
    isFrequencyChanged?: boolean
}

const SummaryTotal = ({
    selectedPlans,
    totalProductAmount,
    interval = PlanInterval.Month,
    currency,
    isFrequencyChanged = false,
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
    } = usePriceSummary(selectedPlans)

    return (
        <div className={css.container}>
            {showDiscountedPrice ? (
                <SummaryTotalWithDiscounts
                    totalWithDiscounts={totalWithDiscounts}
                    totalWithoutDiscounts={totalWithoutDiscounts}
                    discountAmount={discountAmount}
                    currency={currency}
                    interval={interval}
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
                                {formatAmount(oldPlanPrice / 100, currency)}
                            </div>
                        )}
                        <span aria-label="Total price">
                            {formatAmount(amountSelectedPlans / 100, currency)}
                        </span>
                        /{interval}
                    </div>
                </div>
            )}
            <div className={css.disclaimer}>Prices exclusive of sales tax</div>
        </div>
    )
}

function usePriceSummary(selectedPlans: SelectedPlans) {
    const billingSummaryTotalWithCouponsEnabled =
        !!useFlags()[FeatureFlagKey.BillingSummaryTotalWithCoupons]

    const {data: billingState} = useBillingState()
    const coupon: CouponSummary | null =
        billingState?.subscription.coupon ||
        billingState?.customer.coupon ||
        null

    const {totalWithDiscounts, totalWithoutDiscounts, discountAmount} = useMemo(
        () => getTotalWithDiscounts(selectedPlans, coupon),
        [coupon, selectedPlans]
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
