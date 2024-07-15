import React, {useMemo} from 'react'

import {Plan, PlanInterval} from 'models/billing/types'
import {SelectedPlans} from '../../views/BillingProcessView/BillingProcessView'

import {formatAmount} from '../../utils/formatAmount'
import css from './SummaryTotal.less'

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

    return (
        <div className={css.container}>
            <div className={css.total}>
                <div className={css.totalTitle}>Total</div>
                <div className={css.totalPrice}>
                    {!!oldPlanPrice && !isFrequencyChanged && (
                        <div className={css.oldPrice} data-testid="oldPrice">
                            {formatAmount(oldPlanPrice / 100, currency)}
                        </div>
                    )}
                    <span data-testid="totalSum">
                        {formatAmount(amountSelectedPlans / 100, currency)}
                    </span>
                    /{interval}
                </div>
            </div>
            <div className={css.disclaimer}>Prices exclusive of sales tax</div>
        </div>
    )
}

export default SummaryTotal
