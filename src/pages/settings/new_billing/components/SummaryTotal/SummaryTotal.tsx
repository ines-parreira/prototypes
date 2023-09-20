import React, {useMemo} from 'react'

import {
    AutomationPrice,
    ConvertPrice,
    HelpdeskPrice,
    PlanInterval,
    SMSOrVoicePrice,
} from 'models/billing/types'
import {SelectedPlans} from '../../views/BillingProcessView/BillingProcessView'

import {formatAmount} from '../../utils/formatAmount'
import {BILLING_SALES_TAX_URL} from '../../constants'
import css from './SummaryTotal.less'

export type SummaryTotalProps = {
    selectedPlans: SelectedPlans
    totalProductAmount: number
    prices?: (
        | HelpdeskPrice
        | AutomationPrice
        | SMSOrVoicePrice
        | ConvertPrice
    )[]
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

    const oldPrice = useMemo(() => {
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
                    {!!oldPrice && !isFrequencyChanged && (
                        <div className={css.oldPrice} data-testid="oldPrice">
                            {formatAmount(oldPrice / 100, currency)}
                        </div>
                    )}
                    <span>
                        {formatAmount(amountSelectedPlans / 100, currency)}
                    </span>
                    /{interval}
                </div>
            </div>
            <div className={css.disclaimer}>
                Prices do not include{' '}
                <a
                    href={BILLING_SALES_TAX_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Sales tax
                </a>
            </div>
        </div>
    )
}

export default SummaryTotal
