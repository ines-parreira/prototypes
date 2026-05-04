import { useMemo } from 'react'

import {
    Cadence,
    formatAmount,
    getTotalWithDiscounts,
    useBillingState,
} from '@repo/billing'
import type { Plan, ProductType, SelectedPlans } from '@repo/billing'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { Box } from '@gorgias/axiom'

import { BalanceDueRow } from '../BalanceDueRow'
import { ExistingCreditsRow } from '../ExistingCreditsRow'
import SummaryTotalWithDiscounts from './SummaryTotalWithDiscounts'

import css from './SummaryTotal.less'

const UNBILLED_CHARGES_DISCLAIMER =
    "Balance due today doesn't include existing unbilled charges. These charges will be billed at the same time."

export type SummaryTotalProps = {
    selectedPlans: SelectedPlans
    totalProductAmount: number
    prices?: Plan[]
    cadence?: Cadence
    currency: string
    isFrequencyChanged?: boolean
    totalCancelledAmount?: number
    cancelledProducts?: ProductType[]
    balanceDue?: number | null
    isEstimateLoading?: boolean
    estimateErrorMessage?: string
    onRetryEstimate?: () => void
}

const SummaryTotal = ({
    selectedPlans,
    totalProductAmount,
    cadence = Cadence.Month,
    currency,
    isFrequencyChanged = false,
    totalCancelledAmount = 0,
    cancelledProducts = [],
    balanceDue,
    isEstimateLoading = false,
    estimateErrorMessage,
    onRetryEstimate,
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
        unbilledCharges,
        existingCredits,
    } = usePriceSummary(selectedPlans, totalCancelledAmount, cancelledProducts)

    const shouldShowExistingCredits =
        existingCredits != null && existingCredits > 0

    const shouldShowBalanceDue =
        isEstimateLoading ||
        Boolean(estimateErrorMessage) ||
        (balanceDue != null && balanceDue > 0)
    const balanceDueText =
        balanceDue == null
            ? null
            : `${formatAmount(balanceDue / 100, currency)} due today`
    const shouldShowUnbilledChargesDisclaimer = (unbilledCharges ?? 0) > 0

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
            {(shouldShowBalanceDue || shouldShowExistingCredits) && (
                <Box pt="sm" px="xs" flexDirection="column" gap="xxs">
                    {shouldShowExistingCredits && (
                        <ExistingCreditsRow
                            existingCredits={existingCredits}
                            currency={currency}
                        />
                    )}
                    {shouldShowBalanceDue && (
                        <BalanceDueRow
                            isLoading={isEstimateLoading}
                            errorMessage={estimateErrorMessage}
                            onRetry={onRetryEstimate}
                            tooltip={
                                shouldShowUnbilledChargesDisclaimer
                                    ? UNBILLED_CHARGES_DISCLAIMER
                                    : undefined
                            }
                        >
                            {balanceDueText}
                        </BalanceDueRow>
                    )}
                </Box>
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

    const { data: billingState } = useBillingState()
    // TODO(CRMGROW-3557): Drop these casts once SDK CustomerSummary exposes
    // unbilled_charges and existing_credits.
    const customer = billingState?.customer as
        | {
              unbilled_charges?: number | null
              existing_credits?: number | null
          }
        | undefined
    const unbilledCharges = customer?.unbilled_charges
    const existingCredits = customer?.existing_credits ?? null

    const { totalWithDiscounts, totalWithoutDiscounts, discountAmount } =
        useMemo(
            () =>
                getTotalWithDiscounts(
                    selectedPlans,
                    billingState?.subscription?.discounts ?? [],
                    totalCancelledAmount,
                    cancelledProducts,
                ),
            [
                selectedPlans,
                totalCancelledAmount,
                cancelledProducts,
                billingState,
            ],
        )
    const showDiscountedPrice =
        billingSummaryTotalWithCouponsEnabled && discountAmount > 0

    return {
        totalWithDiscounts,
        totalWithoutDiscounts,
        discountAmount,
        showDiscountedPrice,
        unbilledCharges,
        existingCredits,
    }
}

export default SummaryTotal
