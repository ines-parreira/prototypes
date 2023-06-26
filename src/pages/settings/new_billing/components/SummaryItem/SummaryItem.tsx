import React, {useMemo} from 'react'

import {
    AutomationPrice,
    HelpdeskPrice,
    PlanInterval,
    ProductType,
    SMSOrVoicePrice,
} from 'models/billing/types'
import {SelectedPlans} from '../../views/BillingProcessView/BillingProcessView'
import {PRODUCT_INFO} from '../../constants'
import {formatAmount} from '../../utils/formatAmount'

import css from './SummaryItem.less'

export type SummaryItemProps = {
    type: ProductType
    interval?: PlanInterval
    product?: HelpdeskPrice | AutomationPrice | SMSOrVoicePrice
    prices?: (HelpdeskPrice | AutomationPrice | SMSOrVoicePrice)[]
    selectedPlans: SelectedPlans
}

const SummaryItem = ({
    type,
    interval = PlanInterval.Month,
    product,
    prices = [],
    selectedPlans,
}: SummaryItemProps) => {
    const selectedPlan = selectedPlans[type]

    const {price, currency, name, tickets} = useMemo(() => {
        const priceObject = prices.find(
            (price) => price.price_id === selectedPlan.plan?.price_id
        )
        if (!selectedPlan.isSelected || !priceObject) {
            return {
                price: 0,
                currency: null,
                name: null,
                tickets: 0,
            }
        }
        return {
            price: priceObject.amount / 100,
            currency: priceObject.currency,
            name: priceObject.name,
            tickets: priceObject.num_quota_tickets ?? 0,
        }
    }, [prices, selectedPlan])

    const oldPrice = useMemo(() => {
        if (!product || product.price_id === selectedPlan.plan?.price_id) {
            return null
        }
        const priceObject = prices.find(
            (price) => price.price_id === product.price_id
        )
        if (!priceObject) {
            return null
        }
        return priceObject.amount / 100
    }, [prices, product, selectedPlan])

    if (!selectedPlan.isSelected) {
        return null
    }

    return (
        <div className={css.container}>
            <div className={css.details}>
                <div className={css.title}>{PRODUCT_INFO[type].title}</div>
                <div className={css.description}>
                    {name ? `${name} - ` : ''}
                    {`${tickets} ${PRODUCT_INFO[type].counter}/${interval}`}
                </div>
            </div>
            <div className={css.price}>
                {oldPrice && (
                    <div data-testid="oldPrice" className={css.oldPrice}>
                        {formatAmount(oldPrice, currency)}
                    </div>
                )}
                <span>{formatAmount(price, currency)}</span>/{interval}
            </div>
        </div>
    )
}

export default SummaryItem
