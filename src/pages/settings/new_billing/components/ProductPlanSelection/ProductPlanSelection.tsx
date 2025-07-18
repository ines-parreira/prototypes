import React, { useCallback, useMemo, useState } from 'react'

import classNames from 'classnames'

import { CustomerSummary } from '@gorgias/helpdesk-types'
import { Tooltip } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import { Cadence, HelpdeskPlan, Plan, ProductType } from 'models/billing/types'
import { getProductLabel, isStarterTier } from 'models/billing/utils'
import Button from 'pages/common/components/button/Button'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import { Value } from 'pages/common/forms/SelectField/types'
import { handleConvertProductRemoved } from 'pages/settings/new_billing/utils/handleConvertProductRemoved'
import { getCurrentPlansByProduct } from 'state/billing/selectors'
import { CurrentProductsUsages } from 'state/billing/types'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import {
    ENTERPRISE_PLAN_ID,
    PRODUCT_DISABLED_FOR_TRIALING_USERS_TOOLTIP,
    PRODUCT_INFO,
} from '../../constants'
import useIsCancellationAvailable from '../../hooks/useIsCancellationAvailable'
import { formatNumTickets } from '../../utils/formatAmount'
import { SelectedPlans } from '../../views/BillingProcessView/BillingProcessView'
import AutoUpgradeToggle from '../AutoUpgradeToggle'
import Badge, { BadgeType } from '../Badge'
import CancelAAOModal from '../CancelAAOModal/CancelAAOModal'
import CancelProductModal from '../CancelProductModal/CancelProductModal'
import CounterText from '../CounterText'

import css from './ProductPlanSelection.less'

function isHelpdeskPlan(plan: Plan): plan is HelpdeskPlan {
    return 'features' in plan && 'integrations' in plan
}

export type ProductPlanSelectionProps = {
    type: ProductType
    cadence?: Cadence
    currentPlan?: Plan
    availablePlans?: Plan[]
    selectedPlans: SelectedPlans
    setSelectedPlans: React.Dispatch<React.SetStateAction<SelectedPlans>>
    isTrialing?: boolean
    initialIndex?: number
    periodEnd?: string
    currentUsage?: CurrentProductsUsages
    editingAvailable: boolean
    customer?: CustomerSummary | null
}

const ProductPlanSelection = ({
    type,
    currentPlan,
    cadence = Cadence.Month,
    availablePlans = [],
    selectedPlans,
    setSelectedPlans,
    isTrialing = false,
    initialIndex = -1,
    periodEnd,
    currentUsage,
    editingAvailable,
    customer,
}: ProductPlanSelectionProps) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const isActive = useMemo(() => {
        if (!currentPlan) return false
        if (isTrialing) return false

        return true
    }, [currentPlan, isTrialing])

    const selectedPlan = selectedPlans[type].plan

    const [isCancelAAOModalOpen, setIsCancelAAOModalOpen] = useState(false)
    const [isCancellationFlowOpen, setIsCancellationFlowOpen] = useState(false)

    const isStarterHelpdeskPlanDisabled = useCallback(
        (plan: Plan) => {
            if (
                isHelpdeskPlan(plan) &&
                isStarterTier(plan) &&
                cadence === Cadence.Year
            ) {
                return {
                    isDisabled: true,
                    tooltipText:
                        'Switch to monthly billing to downgrade to a Starter plan.',
                }
            }

            return {
                isDisabled: false,
                tooltipText: undefined,
            }
        },
        [cadence],
    )

    const getLabel = useCallback((plan: Plan) => {
        const label = getProductLabel(plan)
        if (label) {
            return label
        }

        return formatNumTickets(plan.num_quota_tickets ?? 0)
    }, [])

    const options = useMemo(
        () => [
            ...availablePlans
                .filter((plan) => {
                    if (
                        (type === ProductType.Voice ||
                            type === ProductType.SMS) &&
                        !!currentPlan
                    ) {
                        return !!plan.num_quota_tickets
                    }

                    if (type === ProductType.Automation) {
                        if (!!currentPlan) {
                            // for Automate, only display plans of the same generation of the current plan.
                            if (currentPlan.generation !== plan.generation) {
                                return false
                            }
                        } else {
                            // if no current Automate plan, show generation-6 plans only.
                            if (plan.generation !== 6) {
                                return false
                            }
                        }
                    }

                    return true
                })
                .map((plan) => ({
                    value: plan.plan_id ?? '',
                    label: getLabel(plan),
                    isDisabled: isStarterHelpdeskPlanDisabled(plan).isDisabled,
                    tooltipText:
                        isStarterHelpdeskPlanDisabled(plan).tooltipText,
                })),
            {
                value: ENTERPRISE_PLAN_ID,
                label: `${formatNumTickets(
                    availablePlans[availablePlans.length - 1]
                        ?.num_quota_tickets ?? 0,
                )}+`,
            },
        ],
        [
            getLabel,
            isStarterHelpdeskPlanDisabled,
            availablePlans,
            currentPlan,
            type,
        ],
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

    const handleConvertClose = useCallback(() => {
        handleClose()
        handleConvertProductRemoved(
            selectedPlan?.plan_id,
            currentAccount.get('domain'),
        )
    }, [handleClose, selectedPlan, currentAccount])

    const currentProducts = useAppSelector(getCurrentPlansByProduct)
    const currentSubscriptionProducts = currentProducts
        ? {
              [ProductType.Helpdesk]: currentProducts.helpdesk,
              [ProductType.Automation]: currentProducts.automation || null,
              [ProductType.Voice]: currentProducts.voice || null,
              [ProductType.SMS]: currentProducts.sms || null,
              [ProductType.Convert]: currentProducts.convert || null,
          }
        : null

    const isCancellationAvailable = useIsCancellationAvailable({
        helpdeskPlan: currentSubscriptionProducts?.helpdesk || null,
        editingAvailable,
        isTrialing,
        customer,
    })

    const handleOpen = useCallback(() => {
        const initialPlan =
            initialIndex === -1
                ? availablePlans.find((plan) => plan.num_quota_tickets)
                : availablePlans[initialIndex]

        setSelectedPlans((prev) => ({
            ...prev,
            [type]: {
                plan: initialPlan,
                isSelected: true,
            },
        }))
    }, [availablePlans, setSelectedPlans, type, initialIndex])

    const handleSelectProductPlan = (plan_id: Value) => {
        const plan = availablePlans.find((plan) => plan.plan_id === plan_id)
        const enterprisePlan = {
            ...availablePlans[availablePlans.length - 1],
            plan_id: ENTERPRISE_PLAN_ID,
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
    const handleOnCancelAutoRenewal = () => {
        setIsCancellationFlowOpen(true)
        logEvent(SegmentEvent.SubscriptionCancellationAutoRenewalClicked, {
            productType: ProductType.Helpdesk,
            productPlan: currentProducts?.helpdesk?.name,
        })
    }

    const productDisabledForTrialingUser: boolean =
        !!isTrialing && (type === ProductType.Voice || type === ProductType.SMS)

    const disabledTooltip = productDisabledForTrialingUser
        ? PRODUCT_DISABLED_FOR_TRIALING_USERS_TOOLTIP
        : undefined

    const renderHeader = () => {
        if (!selectedPlans[type].isSelected) {
            return (
                <>
                    {disabledTooltip && (
                        <Tooltip placement="top" target={`add-product-${type}`}>
                            {disabledTooltip}
                        </Tooltip>
                    )}
                    <Button
                        className={css.addProduct}
                        fillStyle="ghost"
                        intent="primary"
                        size="small"
                        onClick={handleOpen}
                        isDisabled={
                            !editingAvailable || productDisabledForTrialingUser
                        }
                        id={`add-product-${type}`}
                    >
                        <i className="material-icons">
                            {productDisabledForTrialingUser ? 'lock' : 'add'}
                        </i>
                        Add Product
                    </Button>
                </>
            )
        }
        if (!editingAvailable) {
            return null
        }

        if (!isActive) {
            return (
                <Button
                    fillStyle="ghost"
                    intent="secondary"
                    size="small"
                    onClick={handleClose}
                >
                    <i
                        className={classNames(
                            'material-icons',
                            css.closeButton,
                        )}
                        onClick={handleClose}
                    >
                        close
                    </i>
                </Button>
            )
        }
        if (type === ProductType.Helpdesk && isCancellationAvailable) {
            return (
                <Button
                    fillStyle="ghost"
                    intent="destructive"
                    size="small"
                    onClick={handleOnCancelAutoRenewal}
                >
                    Cancel auto-renewal
                </Button>
            )
        } else if (type === ProductType.Automation) {
            return (
                <Button
                    fillStyle="ghost"
                    intent="secondary"
                    size="small"
                    onClick={() => setIsCancelAAOModalOpen(true)}
                >
                    Remove product
                </Button>
            )
        } else if (type === ProductType.Convert) {
            return (
                <Button
                    fillStyle="ghost"
                    intent="secondary"
                    size="small"
                    onClick={handleConvertClose}
                >
                    Remove product
                </Button>
            )
        }

        return null
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
                    <div className="heading-subsection-semibold">
                        {PRODUCT_INFO[type].title}
                    </div>
                    {isActive && (
                        <Badge text="Active" type={BadgeType.Success} />
                    )}
                </div>
                {renderHeader()}
            </div>
            {selectedPlans[type].isSelected && (
                <div className={css.details}>
                    <div className={css.selectedPlan}>
                        <SelectField
                            options={options}
                            id="priceSelect"
                            aria-label="Price value"
                            placeholder="Select a plan"
                            value={selectedPlan?.plan_id}
                            fullWidth
                            onChange={handleSelectProductPlan}
                            showSelectedOption
                            dropdownMenuClassName={css.select}
                            disabled={!editingAvailable}
                        />
                        <div className={css.counter}>
                            <div>
                                <CounterText
                                    plan={selectedPlan}
                                    type={type}
                                    cadence={cadence}
                                />
                            </div>
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
                    &nbsp;
                    {isActive &&
                        currentPlan?.plan_id !== selectedPlan?.plan_id && (
                            <div className={css.oldPrice}>
                                {`${currentPlan?.num_quota_tickets || 0} ${
                                    PRODUCT_INFO[type].counter
                                }/${cadence ?? ''}`}
                            </div>
                        )}
                </div>
            )}
            {selectedPlans[type].isSelected &&
                type === ProductType.Convert &&
                editingAvailable && (
                    <AutoUpgradeToggle
                        type={type}
                        selectedPlans={selectedPlans}
                        setSelectedPlans={setSelectedPlans}
                        availablePlans={availablePlans}
                    />
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
            {isCancellationAvailable &&
                currentSubscriptionProducts &&
                periodEnd && (
                    <CancelProductModal
                        onClose={() => {
                            setIsCancellationFlowOpen(false)
                        }}
                        isOpen={isCancellationFlowOpen}
                        productType={ProductType.Helpdesk}
                        subscriptionProducts={currentSubscriptionProducts}
                        periodEnd={periodEnd}
                    />
                )}
        </div>
    )
}

export default ProductPlanSelection
