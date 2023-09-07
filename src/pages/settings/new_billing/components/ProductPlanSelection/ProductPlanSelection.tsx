import React, {useCallback, useMemo, useState} from 'react'
import classNames from 'classnames'

import {
    AutomationPrice,
    HelpdeskPrice,
    PlanInterval,
    ProductType,
    SMSOrVoicePrice,
} from 'models/billing/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {Value} from 'pages/common/forms/SelectField/types'
import {
    isStarterTierPrice,
    isTrialVoiceOrSMSPrice,
    isAAOLegacyPrice,
} from 'models/billing/utils'
import Tooltip from 'pages/common/components/Tooltip'
import Button from 'pages/common/components/button/Button'
import {CurrentProductsUsages} from 'state/billing/types'
import {ENTERPRISE_PRICE_ID, INTERVAL, PRODUCT_INFO} from '../../constants'
import Badge, {BadgeType} from '../Badge'
import {SelectedPlans} from '../../views/BillingProcessView/BillingProcessView'
import {formatNumTickets} from '../../utils/formatAmount'
import CancelAAOModal from '../CancelAAOModal/CancelAAOModal'
import css from './ProductPlanSelection.less'

export type ProductPlanSelectionProps = {
    type: ProductType
    interval?: PlanInterval
    product?: HelpdeskPrice | AutomationPrice | SMSOrVoicePrice
    prices?: (HelpdeskPrice | AutomationPrice | SMSOrVoicePrice)[]
    selectedPlans: SelectedPlans
    setSelectedPlans: React.Dispatch<React.SetStateAction<SelectedPlans>>
    isStarterHelpdeskPlanSelected?: boolean
    isTrialing?: boolean
    initialIndex?: number
    periodEnd?: string
    currentUsage?: CurrentProductsUsages
}

const ProductPlanSelection = ({
    type,
    product,
    interval = PlanInterval.Month,
    prices = [],
    selectedPlans,
    setSelectedPlans,
    isStarterHelpdeskPlanSelected,
    isTrialing = false,
    initialIndex = -1,
    periodEnd,
    currentUsage,
}: ProductPlanSelectionProps) => {
    const isActive = useMemo(() => {
        if (!product) return false
        if (isTrialing) return false

        return true
    }, [product, isTrialing])

    const selectedPlan = selectedPlans[type].plan

    const [isCancelAAOModalOpen, setIsCancelAAOModalOpen] = useState(false)

    const isStarterHelpdeskPlanDisabled = useCallback(
        (price) => {
            const isStarterPlan = isStarterTierPrice(price)

            const isYearlyInterval = interval === INTERVAL.Year

            const selectedProductsCount = Object.values(selectedPlans).filter(
                (plan) => plan.isSelected
            ).length

            const tooltipText = isYearlyInterval
                ? 'Switch to monthly billing to downgrade to a Starter plan.'
                : selectedProductsCount > 1
                ? 'To downgrade Helpdesk to a Starter plan, please cancel any other active subscriptions.'
                : undefined

            if (isStarterPlan) {
                return {
                    isDisabled: isYearlyInterval || selectedProductsCount > 1,
                    tooltipText: tooltipText,
                }
            }
            return {
                isDisabled: false,
                tooltipText: undefined,
            }
        },
        [interval, selectedPlans]
    )

    const getLabel = useCallback(
        (price: HelpdeskPrice | AutomationPrice | SMSOrVoicePrice) => {
            if (isTrialVoiceOrSMSPrice(price, type)) {
                return 'Trial'
            }

            if (isAAOLegacyPrice(price, type)) {
                return 'Legacy'
            }

            return formatNumTickets(price.num_quota_tickets ?? 0)
        },
        [type]
    )

    const getCounterText = useMemo(() => {
        if (selectedPlan && isTrialVoiceOrSMSPrice(selectedPlan, type)) {
            return (
                <>
                    <strong>
                        ${(selectedPlan?.extra_ticket_cost ?? 0).toFixed(2)}
                    </strong>{' '}
                    {PRODUCT_INFO[type].perTicket}
                </>
            )
        }
        if (selectedPlan && isAAOLegacyPrice(selectedPlan, type)) {
            return (
                <>
                    <strong>
                        ${(selectedPlan?.amount / 100 ?? 0).toFixed(2)}
                    </strong>
                    /{interval}
                </>
            )
        }
        return `${PRODUCT_INFO[type].counter}/${interval}`
    }, [interval, selectedPlan, type])

    const options = useMemo(
        () => [
            ...prices
                .filter((price) => {
                    if (
                        (type === ProductType.Voice ||
                            type === ProductType.SMS) &&
                        !!product
                    ) {
                        return !!price.num_quota_tickets
                    }

                    return true
                })
                .map((price) => ({
                    value: price.price_id ?? '',
                    label: getLabel(price),
                    isDisabled: isStarterHelpdeskPlanDisabled(price).isDisabled,
                    tooltipText:
                        isStarterHelpdeskPlanDisabled(price).tooltipText,
                })),
            {
                value: ENTERPRISE_PRICE_ID,
                label: `${formatNumTickets(
                    prices[prices.length - 1]?.num_quota_tickets ?? 0
                )}+`,
            },
        ],
        [getLabel, isStarterHelpdeskPlanDisabled, prices, product, type]
    )

    const handleClose = useCallback(() => {
        setSelectedPlans((prev) => ({
            ...prev,
            [type]: {
                ...prev[type],
                isSelected: false,
            },
        }))
    }, [setSelectedPlans, type])

    const handleOpen = useCallback(() => {
        if (isStarterHelpdeskPlanSelected) {
            return
        }

        const initialPlan =
            initialIndex === -1
                ? prices.find((price) => price.num_quota_tickets)
                : prices[initialIndex]

        setSelectedPlans((prev) => ({
            ...prev,
            [type]: {
                plan: initialPlan,
                isSelected: true,
            },
        }))
    }, [
        prices,
        setSelectedPlans,
        type,
        isStarterHelpdeskPlanSelected,
        initialIndex,
    ])

    const handleSelectProductPlan = (price_id: Value) => {
        const plan = prices.find((price) => price.price_id === price_id)
        const enterprisePlan = {
            ...prices[prices.length - 1],
            price_id: ENTERPRISE_PRICE_ID,
            name: 'Enterprise',
        }

        setSelectedPlans((prev) => ({
            ...prev,
            [type]: {
                ...prev[type],
                plan: plan ?? enterprisePlan,
            },
        }))
    }

    return (
        <div className={css.container}>
            <div className={css.header}>
                <div className={css.title}>
                    <i
                        className={classNames('material-icons', {
                            [css.activeIcon]: isActive,
                        })}
                    >
                        {PRODUCT_INFO[type].icon}
                    </i>
                    <div>{PRODUCT_INFO[type].title}</div>
                    {isActive && (
                        <Badge text="Active" type={BadgeType.Success} />
                    )}
                </div>
                {(!isActive || type === ProductType.Automation) &&
                    (selectedPlans[type].isSelected ? (
                        type === ProductType.Automation && isActive ? (
                            <Button
                                intent="secondary"
                                className={css.cancelButton}
                                onClick={() => setIsCancelAAOModalOpen(true)}
                            >
                                Remove product
                            </Button>
                        ) : (
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.closeButton
                                )}
                                onClick={handleClose}
                            >
                                close
                            </i>
                        )
                    ) : (
                        <div
                            className={classNames(css.addProduct, {
                                [css.openIsDisabled]:
                                    isStarterHelpdeskPlanSelected,
                            })}
                            onClick={handleOpen}
                        >
                            <i className="material-icons">add</i>Add Product
                        </div>
                    ))}
            </div>
            {selectedPlans[type].isSelected && (
                <div className={css.details}>
                    <div className={css.selectedPlan}>
                        <SelectField
                            options={options}
                            id="priceSelect"
                            placeholder="Select a plan"
                            value={selectedPlan?.price_id}
                            fullWidth
                            onChange={handleSelectProductPlan}
                            data-testid="priceSelect"
                            showSelectedOption
                            dropdownMenuClassName={css.select}
                        />
                        <div className={css.counter}>
                            <div>{getCounterText}</div>
                            <i
                                id={`priceSelectInfo_${type}`}
                                className="material-icons"
                            >
                                info_outlined
                            </i>
                            <Tooltip
                                placement="top-start"
                                target={`priceSelectInfo_${type}`}
                                className={css.tooltip}
                                autohide={false}
                            >
                                {PRODUCT_INFO[type].tooltip}
                                <a
                                    href={PRODUCT_INFO[type].tooltipLink}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Learn more
                                </a>
                            </Tooltip>
                        </div>
                        {type === ProductType.Helpdesk && (
                            <div className={css.productName}>
                                {selectedPlan?.name}
                            </div>
                        )}
                    </div>
                    {isActive &&
                        product?.price_id !== selectedPlan?.price_id && (
                            <div className={css.oldPrice}>
                                {`${product?.num_quota_tickets || 0} ${
                                    PRODUCT_INFO[type].counter
                                }/${interval ?? ''}`}
                            </div>
                        )}
                </div>
            )}
            {!!periodEnd && !!currentUsage && (
                <CancelAAOModal
                    isOpen={isCancelAAOModalOpen}
                    handleCancelAAO={handleClose}
                    handleOnClose={() => setIsCancelAAOModalOpen(false)}
                    periodEnd={periodEnd}
                    currentUsage={currentUsage}
                />
            )}
        </div>
    )
}

export default ProductPlanSelection
