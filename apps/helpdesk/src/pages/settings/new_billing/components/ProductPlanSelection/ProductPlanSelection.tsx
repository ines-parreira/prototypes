import type React from 'react'
import { useCallback, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import moment from 'moment'

import {
    LegacyButton as Button,
    Color,
    Tag,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'
import type { CustomerSummary } from '@gorgias/helpdesk-types'

import useAppSelector from 'hooks/useAppSelector'
import type { Plan } from 'models/billing/types'
import { Cadence, ProductType } from 'models/billing/types'
import {
    getProductInfo,
    getProductLabel,
    getProductTrackingName,
    isHelpdesk,
    isStarterTier,
} from 'models/billing/utils'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import type { Value } from 'pages/common/forms/SelectField/types'
import { handleConvertProductRemoved } from 'pages/settings/new_billing/utils/handleConvertProductRemoved'
import { getCurrentPlansByProduct } from 'state/billing/selectors'
import { TicketPurpose } from 'state/billing/types'
import type { CurrentProductsUsages } from 'state/billing/types'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import {
    DATE_FORMAT,
    ENTERPRISE_PLAN_ID,
    PRODUCT_DISABLED_FOR_TRIALING_USERS_TOOLTIP,
} from '../../constants'
import useIsCancellationAvailable from '../../hooks/useIsCancellationAvailable'
import { formatNumTickets } from '../../utils/formatAmount'
import type { SelectedPlans } from '../../views/BillingProcessView/BillingProcessView'
import AutoUpgradeToggle from '../AutoUpgradeToggle'
import CancelAAOModal from '../CancelAAOModal/CancelAAOModal'
import CancelProductModal from '../CancelProductModal/CancelProductModal'
import CounterText from '../CounterText'

import css from './ProductPlanSelection.less'

export type ProductPlanSelectionProps = {
    type: ProductType
    cadence?: Cadence
    currentPlan?: Plan
    availablePlans?: Plan[]
    selectedPlans: SelectedPlans
    setSelectedPlans: React.Dispatch<React.SetStateAction<SelectedPlans>>
    isTrialing?: boolean
    initialIndex?: number
    periodEnd: string
    currentUsage?: CurrentProductsUsages
    editingAvailable: boolean
    customer?: CustomerSummary | null
    updateSubscription: () => Promise<unknown>
    scheduledToCancelAt?: string | null
    cancelledProducts?: ProductType[]
    contactBilling: (ticketPurpose: TicketPurpose) => void
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
    updateSubscription,
    scheduledToCancelAt,
    cancelledProducts = [],
    contactBilling,
}: ProductPlanSelectionProps) => {
    const productInfo = getProductInfo(type, currentPlan)
    const currentAccount = useAppSelector(getCurrentAccountState)

    // Feature flag to enable consolidated cancellation modal for all products.
    const useConsolidatedCancellationModal = useFlag(
        FeatureFlagKey.EnableConsolidatedCancellationModal,
        false,
    )
    const useConsolidatedCancellationModalPhone = useFlag(
        FeatureFlagKey.EnableConsolidatedCancellationModalPhone,
        false,
    )

    const isActive = useMemo(() => {
        if (!currentPlan) return false
        if (isTrialing) return false

        return true
    }, [currentPlan, isTrialing])

    const selectedPlan = selectedPlans[type].plan

    const [isCancellationFlowOpen, setIsCancellationFlowOpen] = useState(false)
    const [isCancelAAOModalOpen, setIsCancelAAOModalOpen] = useState(false)

    const isStarterHelpdeskPlanDisabled = useCallback(
        (plan: Plan) => {
            if (
                isHelpdesk(plan) &&
                isStarterTier(plan) &&
                cadence !== Cadence.Month
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
                    value: plan.plan_id,
                    label: getLabel(plan),
                    ...isStarterHelpdeskPlanDisabled(plan),
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
        if (useConsolidatedCancellationModal) {
            setIsCancellationFlowOpen(true)
        } else {
            handleClose()
            handleConvertProductRemoved(
                selectedPlan?.plan_id,
                currentAccount.get('domain'),
            )
        }
    }, [
        handleClose,
        selectedPlan,
        currentAccount,
        useConsolidatedCancellationModal,
    ])

    const currentProducts = useAppSelector(getCurrentPlansByProduct)
    const currentSubscriptionProducts = useMemo(
        () =>
            currentProducts
                ? {
                      [ProductType.Helpdesk]: currentProducts.helpdesk,
                      [ProductType.Automation]:
                          currentProducts.automation || null,
                      [ProductType.Voice]: currentProducts.voice || null,
                      [ProductType.SMS]: currentProducts.sms || null,
                      [ProductType.Convert]: currentProducts.convert || null,
                  }
                : null,
        [currentProducts],
    )

    const isCancellationAvailable = useIsCancellationAvailable({
        helpdeskPlan: currentSubscriptionProducts?.helpdesk || null,
        editingAvailable,
        isTrialing,
        customer,
    })

    const showCancelProductModal = useMemo(
        () =>
            (type === ProductType.Helpdesk && isCancellationAvailable) ||
            ([ProductType.Voice, ProductType.SMS].includes(type) &&
                useConsolidatedCancellationModalPhone) ||
            ([ProductType.Automation, ProductType.Convert].includes(type) &&
                useConsolidatedCancellationModal),
        [
            type,
            isCancellationAvailable,
            useConsolidatedCancellationModalPhone,
            useConsolidatedCancellationModal,
        ],
    )

    const statusBadge = useMemo(() => {
        if (!isActive) return null

        if (scheduledToCancelAt) {
            const formattedDate =
                moment(scheduledToCancelAt).format(DATE_FORMAT)
            return <Tag color={Color.Orange}>Active until {formattedDate}</Tag>
        }

        return <Tag color={Color.Green}>Active</Tag>
    }, [isActive, scheduledToCancelAt])

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
        if (plan) {
            logEvent(SegmentEvent.BillingUsageAndPlansPlanSelected, {
                product: getProductTrackingName(plan.product),
                value: plan.num_quota_tickets,
            })
        } else {
            // trigger a specific event when enterprise plan selected
            logEvent(SegmentEvent.BillingUsageAndPlansEnterprisePlanSelected, {
                product: getProductTrackingName(type),
            })
        }
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

    const disabledDueToScheduledCancellation = !!scheduledToCancelAt

    const isSelectFieldDisabled =
        !editingAvailable || disabledDueToScheduledCancellation

    const scheduledCancellationTooltip = useMemo(() => {
        return (
            <>
                Your product is scheduled to cancel. To reactivate, please{' '}
                <span
                    className={css.link}
                    onClick={() => contactBilling(TicketPurpose.CONTACT_US)}
                >
                    get in touch
                </span>{' '}
                with our team.
            </>
        )
    }, [contactBilling])

    const renderRemoveProductButton = useCallback(
        (onClick: () => void) => {
            return (
                <>
                    {disabledDueToScheduledCancellation && (
                        <Tooltip
                            placement="top"
                            target={`remove-product-${type}`}
                            autohide={false}
                        >
                            {scheduledCancellationTooltip}
                        </Tooltip>
                    )}
                    <Button
                        fillStyle="ghost"
                        intent="secondary"
                        size="small"
                        onClick={() => {
                            logEvent(
                                SegmentEvent.BillingUsageAndPlansRemoveProductClicked,
                                { product: getProductTrackingName(type) },
                            )
                            onClick()
                        }}
                        isDisabled={disabledDueToScheduledCancellation}
                        id={`remove-product-${type}`}
                    >
                        Remove product
                    </Button>
                </>
            )
        },
        [
            disabledDueToScheduledCancellation,
            scheduledCancellationTooltip,
            type,
        ],
    )

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
                        onClick={() => {
                            logEvent(
                                SegmentEvent.BillingUsageAndPlansAddProductClicked,
                                { product: getProductTrackingName(type) },
                            )
                            handleOpen()
                        }}
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
                    onClick={() => {
                        logEvent(
                            SegmentEvent.BillingUsageAndPlansCancelAutoRenewalClicked,
                        )
                        handleOnCancelAutoRenewal()
                    }}
                >
                    Cancel auto-renewal
                </Button>
            )
        }
        if (type === ProductType.Automation) {
            return renderRemoveProductButton(() => {
                if (useConsolidatedCancellationModal) {
                    setIsCancellationFlowOpen(true)
                } else {
                    setIsCancelAAOModalOpen(true)
                }
            })
        } else if (type === ProductType.Convert) {
            return renderRemoveProductButton(handleConvertClose)
        } else if (
            type === ProductType.SMS &&
            useConsolidatedCancellationModalPhone
        ) {
            return renderRemoveProductButton(() => {
                setIsCancellationFlowOpen(true)
            })
        } else if (
            type === ProductType.Voice &&
            useConsolidatedCancellationModalPhone
        ) {
            return renderRemoveProductButton(() => {
                setIsCancellationFlowOpen(true)
            })
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
                        {productInfo.icon}
                    </i>
                    <div className="heading-subsection-semibold">
                        {productInfo.title}
                    </div>
                    {statusBadge}
                </div>
                {renderHeader()}
            </div>
            {selectedPlans[type].isSelected && (
                <div className={css.details}>
                    <div className={css.selectedPlan}>
                        <div
                            id={`priceSelect_${type}_wrapper`}
                            className={css.selectWrapper}
                        >
                            <SelectField
                                options={options}
                                id={`priceSelect_${type}`}
                                aria-label="Price value"
                                placeholder="Select a plan"
                                value={selectedPlan?.plan_id}
                                fullWidth
                                onChange={handleSelectProductPlan}
                                showSelectedOption
                                dropdownMenuClassName={css.select}
                                disabled={isSelectFieldDisabled}
                            />
                        </div>
                        {isSelectFieldDisabled && (
                            <Tooltip
                                placement="top"
                                target={`priceSelect_${type}_wrapper`}
                                autohide={false}
                            >
                                {scheduledCancellationTooltip}
                            </Tooltip>
                        )}
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
                                {productInfo.tooltip}
                                <a
                                    href={productInfo.tooltipLink}
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
                                    productInfo.counter
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
            {!!currentUsage && !useConsolidatedCancellationModal && (
                <CancelAAOModal
                    isOpen={isCancelAAOModalOpen}
                    handleCancelAAO={handleClose}
                    handleOnClose={() => setIsCancelAAOModalOpen(false)}
                    periodEnd={periodEnd}
                    currentUsage={currentUsage}
                />
            )}
            {showCancelProductModal && currentSubscriptionProducts && (
                <CancelProductModal
                    onClose={() => {
                        setIsCancellationFlowOpen(false)
                    }}
                    isOpen={isCancellationFlowOpen}
                    productType={type}
                    subscriptionProducts={currentSubscriptionProducts}
                    periodEnd={periodEnd}
                    currentUsage={currentUsage}
                    selectedPlans={selectedPlans}
                    setSelectedPlans={setSelectedPlans}
                    onCancellationConfirmed={() => {
                        if (type === ProductType.Convert) {
                            handleConvertProductRemoved(
                                selectedPlan?.plan_id,
                                currentAccount.get('domain'),
                            )
                        }
                        setIsCancellationFlowOpen(false)
                    }}
                    updateSubscription={updateSubscription}
                    cancelledProducts={cancelledProducts}
                />
            )}
        </div>
    )
}

export default ProductPlanSelection
