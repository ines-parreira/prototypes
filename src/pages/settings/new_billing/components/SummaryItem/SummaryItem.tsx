import {Tooltip} from '@gorgias/merchant-ui-kit'
import classNames from 'classnames'
import React, {useMemo} from 'react'

import {Plan, Cadence, ProductType} from 'models/billing/types'
import {
    getOverageUnitPriceFormatted,
    getPlanPrice,
    getProductLabel,
    isTrial,
} from 'models/billing/utils'

import warningIcon from '../../../../../assets/img/icons/warning.svg'
import {ENTERPRISE_PRICE_ID, PRODUCT_INFO} from '../../constants'
import {formatAmount} from '../../utils/formatAmount'

import {getNextTier} from '../../utils/getNextTier'
import {SelectedPlans} from '../../views/BillingProcessView/BillingProcessView'
import css from './SummaryItem.less'

export type SummaryItemProps = {
    productType: ProductType
    cadence?: Cadence
    currentPlan?: Plan
    availablePlans?: Plan[]
    selectedPlans: SelectedPlans
    isFrequencyChanged?: boolean
}

const SummaryItem = ({
    productType,
    cadence = Cadence.Month,
    currentPlan,
    availablePlans = [],
    selectedPlans,
    isFrequencyChanged = false,
}: SummaryItemProps) => {
    const selectedPlan = selectedPlans[productType]

    const {price, currency, name, tickets} = useMemo(() => {
        const _selectedPlan = availablePlans.find(
            (plan) => plan.price_id === selectedPlan.plan?.price_id
        )
        if (!selectedPlan.isSelected || !_selectedPlan) {
            return {
                price: getPlanPrice(currentPlan),
                currency: null,
                name: null,
                tickets: currentPlan?.num_quota_tickets ?? 0,
            }
        }
        return {
            price: getPlanPrice(_selectedPlan),
            currency: _selectedPlan.currency,
            name: _selectedPlan.name,
            tickets: _selectedPlan.num_quota_tickets ?? 0,
        }
    }, [availablePlans, selectedPlan, currentPlan])

    const oldPlanPrice = useMemo(() => {
        if (
            !currentPlan ||
            currentPlan.price_id === selectedPlan.plan?.price_id
        ) {
            return null
        }
        const oldPlan = availablePlans.find(
            (plan) => plan.price_id === currentPlan.price_id
        )
        if (!oldPlan) {
            return null
        }
        return getPlanPrice(oldPlan)
    }, [availablePlans, currentPlan, selectedPlan])

    const description = useMemo(() => {
        if (selectedPlan.plan) {
            const label = getProductLabel(selectedPlan.plan)
            if (label) {
                return <div>{label}</div>
            }
        }

        return (
            <>
                {tickets} {PRODUCT_INFO[productType].counter}/{cadence}
            </>
        )
    }, [cadence, selectedPlan.plan, tickets, productType])

    if (!selectedPlan.isSelected && !currentPlan) {
        return null
    }

    return (
        <div className={css.container}>
            <div
                className={classNames(css.details, {
                    [css.strikeThrough]: !selectedPlan.isSelected,
                })}
            >
                <div className={css.title}>
                    {PRODUCT_INFO[productType].title}
                </div>
                <div className={css.description}>
                    {productType === ProductType.Helpdesk && name
                        ? `${name} - `
                        : ''}
                    {description}
                </div>
            </div>
            <div
                className={classNames(css.price, {
                    [css.strikeThrough]: !selectedPlan.isSelected,
                })}
            >
                {!!oldPlanPrice &&
                    selectedPlan.isSelected &&
                    !isFrequencyChanged && (
                        <div aria-label="Old price" className={css.oldPrice}>
                            {formatAmount(oldPlanPrice, currency)}
                        </div>
                    )}
                {selectedPlan.plan && isTrial(selectedPlan.plan) ? (
                    <>
                        <b>{getOverageUnitPriceFormatted(selectedPlan.plan)}</b>{' '}
                        {PRODUCT_INFO[productType].perTicket}
                    </>
                ) : (
                    <>
                        <span>{formatAmount(price, currency)}</span>/{cadence}
                    </>
                )}
                {selectedPlan.isSelected &&
                    productType === ProductType.Convert &&
                    selectedPlan.plan?.price_id !== ENTERPRISE_PRICE_ID &&
                    getNextTier(availablePlans, selectedPlan.plan) && (
                        <div>
                            {selectedPlan.autoUpgrade ? (
                                <>Auto-upgrade enabled</>
                            ) : (
                                <>
                                    <img
                                        src={warningIcon}
                                        alt="warning icon"
                                        id={`summary-auto-upgrade-disabled-${productType}`}
                                        className={`material-icons ${css.autoUpgradeWarningIcon} mr-1`}
                                    />
                                    <Tooltip
                                        target={`summary-auto-upgrade-disabled-${productType}`}
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
