import React, {useCallback, useMemo} from 'react'
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
import {isStarterTierPrice} from 'models/billing/utils'
import {ENTERPRISE_PRICE_ID, INTERVAL, PRODUCT_INFO} from '../../constants'
import Badge, {BadgeType} from '../Badge'
import {SelectedPlans} from '../../views/BillingProcessView/BillingProcessView'
import {formatNumTickets} from '../../utils/formatAmount'
import css from './ProductPlanSelection.less'

export type ProductPlanSelectionProps = {
    type: ProductType
    interval?: PlanInterval
    product?: HelpdeskPrice | AutomationPrice | SMSOrVoicePrice
    prices?: (HelpdeskPrice | AutomationPrice | SMSOrVoicePrice)[]
    selectedPlans: SelectedPlans
    setSelectedPlans: React.Dispatch<React.SetStateAction<SelectedPlans>>
    isStarterHelpdeskPlanSelected?: boolean
}

const ProductPlanSelection = ({
    type,
    product,
    interval,
    prices = [],
    selectedPlans,
    setSelectedPlans,
    isStarterHelpdeskPlanSelected,
}: ProductPlanSelectionProps) => {
    const isActive = useMemo(() => !!product, [product])

    const isStarterHelpdeskPlanDisabled = useCallback(() => {
        const isStarterPlan = isStarterTierPrice(
            selectedPlans[ProductType.Helpdesk].plan
        )

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
    }, [interval, selectedPlans])

    const options = useMemo(
        () => [
            ...prices.map((price) => ({
                value: price.price_id ?? '',
                label: formatNumTickets(price.num_quota_tickets ?? 0),
                isDisabled: isStarterHelpdeskPlanDisabled().isDisabled,
                tooltipText: isStarterHelpdeskPlanDisabled().tooltipText,
            })),
            {
                value: ENTERPRISE_PRICE_ID,
                label: `${formatNumTickets(
                    prices[prices.length - 1]?.num_quota_tickets ?? 0
                )}+`,
            },
        ],
        [isStarterHelpdeskPlanDisabled, prices]
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

        setSelectedPlans((prev) => ({
            ...prev,
            [type]: {
                plan: prices[0],
                isSelected: true,
            },
        }))
    }, [prices, setSelectedPlans, type, isStarterHelpdeskPlanSelected])

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
                {!isActive &&
                    (selectedPlans[type].isSelected ? (
                        <i
                            className={classNames(
                                'material-icons',
                                css.closeButton
                            )}
                            onClick={handleClose}
                        >
                            close
                        </i>
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
                            value={selectedPlans[type].plan?.price_id}
                            fullWidth
                            onChange={handleSelectProductPlan}
                            data-testid="priceSelect"
                            showSelectedOption
                        />
                        <div className={css.counter}>
                            <div>
                                {PRODUCT_INFO[type].counter}/{interval}
                            </div>
                            <i className="material-icons">info_outlined</i>
                        </div>
                        <div className={css.productName}>
                            {selectedPlans[type].plan?.name}
                        </div>
                    </div>
                    {isActive &&
                        product?.price_id !==
                            selectedPlans[type].plan?.price_id && (
                            <div className={css.oldPrice}>
                                {`${product?.num_quota_tickets || 0} ${
                                    PRODUCT_INFO[type].counter
                                }/${interval ?? ''}`}
                            </div>
                        )}
                </div>
            )}
        </div>
    )
}

export default ProductPlanSelection
