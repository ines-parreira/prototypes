import { useMemo } from 'react'

import classNames from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import type { Plan } from 'models/billing/types'
import { Cadence, ProductType } from 'models/billing/types'
import {
    getOverageUnitPriceFormatted,
    getPlanPrice,
    getProductInfo,
    getProductLabel,
    isEnterprise,
    isTrial,
} from 'models/billing/utils'

import warningIcon from '../../../../../assets/img/icons/warning.svg'
import { formatAmount } from '../../utils/formatAmount'
import { getNextTier } from '../../utils/getNextTier'
import type { SelectedPlans } from '../../views/BillingProcessView/BillingProcessView'
import { SummaryItemTitle } from './SummaryItemTitle'

import css from './SummaryItem.less'

export type SummaryItemProps = {
    productType: ProductType
    cadence?: Cadence
    currentPlan?: Plan
    availablePlans?: Plan[]
    selectedPlans: SelectedPlans
    isFrequencyChanged?: boolean
    scheduledToCancelAt?: string | null
}

export const SummaryItem = ({
    productType,
    cadence = Cadence.Month,
    currentPlan,
    availablePlans = [],
    selectedPlans,
    isFrequencyChanged = false,
    scheduledToCancelAt,
}: SummaryItemProps) => {
    const selectedPlan = selectedPlans[productType]
    const productInfo = getProductInfo(productType, selectedPlan.plan)

    const { price, currency, name, tickets } = useMemo(() => {
        const _selectedPlan = availablePlans.find(
            (plan) => plan.plan_id === selectedPlan.plan?.plan_id,
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
            currentPlan.plan_id === selectedPlan.plan?.plan_id
        ) {
            return null
        }
        const oldPlan = availablePlans.find(
            (plan) => plan.plan_id === currentPlan.plan_id,
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
                {tickets} {productInfo.counter}/{cadence}
            </>
        )
    }, [cadence, selectedPlan.plan, tickets, productInfo])

    if (!selectedPlan.isSelected && !currentPlan) {
        return null
    }

    return (
        <div className={css.container}>
            <div
                className={classNames(css.details, {
                    [css.strikeThrough]:
                        !selectedPlan.isSelected || !!scheduledToCancelAt,
                })}
            >
                <SummaryItemTitle
                    title={productInfo.title}
                    isSelected={selectedPlan.isSelected}
                    selectedPlanId={selectedPlan.plan?.plan_id}
                    currentPlan={currentPlan}
                    availablePlans={availablePlans}
                />
                <div className={css.description}>
                    {productType === ProductType.Helpdesk && name
                        ? `${name} - `
                        : ''}
                    {description}
                </div>
            </div>
            <div
                className={classNames(css.price, {
                    [css.strikeThrough]:
                        !selectedPlan.isSelected || !!scheduledToCancelAt,
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
                        {productInfo.perTicket}
                    </>
                ) : (
                    <>
                        <span>
                            {formatAmount(
                                !!scheduledToCancelAt ? 0 : price,
                                currency,
                            )}
                        </span>
                        /{cadence}
                    </>
                )}
                {selectedPlan.isSelected &&
                    productType === ProductType.Convert &&
                    !isEnterprise(selectedPlan.plan) &&
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
