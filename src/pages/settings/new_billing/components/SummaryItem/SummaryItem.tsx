import React, {useMemo} from 'react'

import classNames from 'classnames'
import {Tooltip} from '@gorgias/ui-kit'
import {Plan, PlanInterval, ProductType} from 'models/billing/types'
import {getProductLabel, isTrial} from 'models/billing/utils'
import {SelectedPlans} from '../../views/BillingProcessView/BillingProcessView'
import {ENTERPRISE_PRICE_ID, PRODUCT_INFO} from '../../constants'
import {formatAmount} from '../../utils/formatAmount'

import warningIcon from '../../../../../assets/img/icons/warning.svg'
import {getNextTier} from '../../utils/getNextTier'
import css from './SummaryItem.less'

export type SummaryItemProps = {
    productType: ProductType
    interval?: PlanInterval
    currentPlan?: Plan
    availablePlans?: Plan[]
    selectedPlans: SelectedPlans
    isFrequencyChanged?: boolean
}

const SummaryItem = ({
    productType,
    interval = PlanInterval.Month,
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
                price: (currentPlan?.amount ?? 0) / 100,
                currency: null,
                name: null,
                tickets: currentPlan?.num_quota_tickets ?? 0,
            }
        }
        return {
            price: _selectedPlan.amount / 100,
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
        return oldPlan.amount / 100
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
                {tickets} {PRODUCT_INFO[productType].counter}/{interval}
            </>
        )
    }, [interval, selectedPlan.plan, tickets, productType])

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
                        <div data-testid="oldPrice" className={css.oldPrice}>
                            {formatAmount(oldPlanPrice, currency)}
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
                        {PRODUCT_INFO[productType].perTicket}
                    </>
                ) : (
                    <>
                        <span>{formatAmount(price, currency)}</span>/{interval}
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
