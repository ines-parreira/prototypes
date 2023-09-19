import React, {useMemo} from 'react'

import classNames from 'classnames'
import {
    AutomationPrice,
    ConvertPrice,
    HelpdeskPrice,
    PlanInterval,
    ProductType,
    SMSOrVoicePrice,
} from 'models/billing/types'
import {isAAOLegacyPrice, isTrialPrice} from 'models/billing/utils'
import {SelectedPlans} from '../../views/BillingProcessView/BillingProcessView'
import {PRODUCT_INFO} from '../../constants'
import {formatAmount} from '../../utils/formatAmount'

import css from './SummaryItem.less'

export type SummaryItemProps = {
    type: ProductType
    interval?: PlanInterval
    product?: HelpdeskPrice | AutomationPrice | SMSOrVoicePrice | ConvertPrice
    prices?: (
        | HelpdeskPrice
        | AutomationPrice
        | SMSOrVoicePrice
        | ConvertPrice
    )[]
    selectedPlans: SelectedPlans
    isFrequencyChanged?: boolean
}

const SummaryItem = ({
    type,
    interval = PlanInterval.Month,
    product,
    prices = [],
    selectedPlans,
    isFrequencyChanged = false,
}: SummaryItemProps) => {
    const selectedPlan = selectedPlans[type]

    const {price, currency, name, tickets} = useMemo(() => {
        const priceObject = prices.find(
            (price) => price.price_id === selectedPlan.plan?.price_id
        )
        if (!selectedPlan.isSelected || !priceObject) {
            return {
                price: (product?.amount ?? 0) / 100,
                currency: null,
                name: null,
                tickets: product?.num_quota_tickets ?? 0,
            }
        }
        return {
            price: priceObject.amount / 100,
            currency: priceObject.currency,
            name: priceObject.name,
            tickets: priceObject.num_quota_tickets ?? 0,
        }
    }, [prices, selectedPlan, product])

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

    const description = useMemo(() => {
        if (selectedPlan.plan && isTrialPrice(selectedPlan.plan, type)) {
            return <div>Trial</div>
        }

        if (selectedPlan.plan && isAAOLegacyPrice(selectedPlan.plan, type)) {
            return <>Legacy</>
        }

        return (
            <>
                {tickets} {PRODUCT_INFO[type].counter}/{interval}
            </>
        )
    }, [interval, selectedPlan.plan, tickets, type])

    if (!selectedPlan.isSelected && !product) {
        return null
    }

    return (
        <div className={css.container}>
            <div
                className={classNames(css.details, {
                    [css.strikeThrough]: !selectedPlan.isSelected,
                })}
            >
                <div className={css.title}>{PRODUCT_INFO[type].title}</div>
                <div className={css.description}>
                    {type === ProductType.Helpdesk && name ? `${name} - ` : ''}
                    {description}
                </div>
            </div>
            <div
                className={classNames(css.price, {
                    [css.strikeThrough]: !selectedPlan.isSelected,
                })}
            >
                {!!oldPrice && selectedPlan.isSelected && !isFrequencyChanged && (
                    <div data-testid="oldPrice" className={css.oldPrice}>
                        {formatAmount(oldPrice, currency)}
                    </div>
                )}
                {selectedPlan.plan && isTrialPrice(selectedPlan.plan, type) ? (
                    <>
                        <b>
                            $
                            {(selectedPlan.plan.extra_ticket_cost ?? 0).toFixed(
                                2
                            )}
                        </b>{' '}
                        {PRODUCT_INFO[type].perTicket}
                    </>
                ) : (
                    <>
                        <span>{formatAmount(price, currency)}</span>/{interval}
                    </>
                )}
            </div>
        </div>
    )
}

export default SummaryItem
