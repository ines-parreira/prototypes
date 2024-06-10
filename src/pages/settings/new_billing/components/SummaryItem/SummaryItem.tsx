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
import {getProductLabel, isTrial} from 'models/billing/utils'
import {SelectedPlans} from '../../views/BillingProcessView/BillingProcessView'
import {ENTERPRISE_PRICE_ID, PRODUCT_INFO} from '../../constants'
import {formatAmount} from '../../utils/formatAmount'

import warningIcon from '../../../../../assets/img/icons/warning.svg'
import Tooltip from '../../../../common/components/Tooltip'
import {getNextTier} from '../../utils/getNextTier'
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
        if (selectedPlan.plan) {
            const label = getProductLabel(selectedPlan.plan)
            if (label) {
                return <div>{label}</div>
            }
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
                {selectedPlan.plan && isTrial(selectedPlan.plan) ? (
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
                {selectedPlan.isSelected &&
                    type === ProductType.Convert &&
                    selectedPlan.plan?.price_id !== ENTERPRISE_PRICE_ID &&
                    getNextTier(prices, selectedPlan.plan) && (
                        <div>
                            {selectedPlan.autoUpgrade ? (
                                <>Auto-upgrade enabled</>
                            ) : (
                                <>
                                    <img
                                        src={warningIcon}
                                        alt="warning icon"
                                        id={`summary-auto-upgrade-disabled-${type}`}
                                        className={`material-icons ${css.autoUpgradeWarningIcon} mr-1`}
                                    />
                                    <Tooltip
                                        target={`summary-auto-upgrade-disabled-${type}`}
                                        placement="bottom-end"
                                    >
                                        Without auto-upgrade, campaigns will
                                        stop being displayed if you reach 100%
                                        of your allowance before the end of the
                                        billing period.
                                    </Tooltip>
                                    Auto-upgrade disabled
                                </>
                            )}
                        </div>
                    )}
            </div>
        </div>
    )
}

export default SummaryItem
