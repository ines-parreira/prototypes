import type React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import _capitalize from 'lodash/capitalize'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { dismissNotification } from 'reapop'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useBillingState } from 'billing/hooks/useBillingState'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type {
    AutomatePlan,
    ConvertPlan,
    HelpdeskPlan,
    PlanId,
    SMSOrVoicePlan,
} from 'models/billing/types'
import { ProductType } from 'models/billing/types'
import {
    getProductInfo,
    isEnterprise,
    isYearlyContractPlan,
} from 'models/billing/utils'
import Loader from 'pages/common/components/Loader/Loader'
import PendingChangesModal from 'pages/settings/helpCenter/components/PendingChangesModal/PendingChangesModal'
import { NewSummaryPaymentSection } from 'pages/settings/new_billing/components/SummaryPaymentSection/NewSummaryPaymentSection'
import { useIsPaymentEnabled } from 'pages/settings/new_billing/hooks/useIsPaymentEnabled'
import { useHasCreditCard } from 'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useHasCreditCard'
import { getCurrentPlansByProduct } from 'state/billing/selectors'
import type { CurrentProductsUsages } from 'state/billing/types'
import { TicketPurpose } from 'state/billing/types'
import {
    getCurrentSubscription,
    shouldPayWithShopify as getShouldPayWithShopify,
} from 'state/currentAccount/selectors'

import BackLink from '../../components/BackLink'
import Card from '../../components/Card'
import ProductPlanSelection from '../../components/ProductPlanSelection'
import ScheduledCancellationSummary from '../../components/ScheduledCancellationSummary'
import SummaryFooter from '../../components/SummaryFooter'
import SummaryItem from '../../components/SummaryItem'
import SummaryTotal from '../../components/SummaryTotal'
import VoiceOrSmsChangeReviewAlert from '../../components/VoiceOrSmsChangeReviewAlert'
import { BILLING_BASE_PATH, PRICING_DETAILS_URL } from '../../constants'
import { useBillingPlans } from '../../hooks/useBillingPlan'
import useProductCancellations from '../../hooks/useProductCancellations'
import { formatNumTickets } from '../../utils/formatAmount'

import css from './BillingProcessView.less'

type Params = {
    selectedProduct: ProductType
}

type BillingProcessViewProps = {
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    contactBilling: (ticketPurpose: TicketPurpose) => void
    setDefaultMessage: React.Dispatch<React.SetStateAction<string>>
    dispatchBillingError: (error: unknown) => void
    isTrialing: boolean
    isCurrentSubscriptionCanceled: boolean
    periodEnd: string
    currentUsage?: CurrentProductsUsages
    setSessionSelectedPlans?: React.Dispatch<SelectedPlans>
}

export type SelectedPlans = {
    [ProductType.Helpdesk]: {
        plan?: HelpdeskPlan
        isSelected: boolean
        autoUpgrade?: false
    }
    [ProductType.Automation]: {
        plan?: AutomatePlan
        isSelected: boolean
        autoUpgrade?: false
    }
    [ProductType.Voice]: {
        plan?: SMSOrVoicePlan
        isSelected: boolean
        autoUpgrade?: false
    }
    [ProductType.SMS]: {
        plan?: SMSOrVoicePlan
        isSelected: boolean
        autoUpgrade?: false
    }
    [ProductType.Convert]: {
        plan?: ConvertPlan
        isSelected: boolean
        autoUpgrade?: boolean
    }
}

const BillingProcessView = ({
    setIsModalOpen,
    contactBilling,
    setDefaultMessage,
    dispatchBillingError,
    isTrialing,
    periodEnd,
    isCurrentSubscriptionCanceled,
    currentUsage,
    setSessionSelectedPlans,
}: BillingProcessViewProps) => {
    const dispatch = useAppDispatch()
    const hasCreditCard = useHasCreditCard()
    const isPaymentEnabled = !!useIsPaymentEnabled()
    const [showPendingChangesModal, setShowPendingChangesModal] =
        useState(false)
    const [updateProcessStarted, setUpdateProcessStarted] = useState(false)
    const { pathname } = useLocation()

    // Current subscription state
    const currentSubscriptionScheduledToCancelAt = useAppSelector(
        getCurrentSubscription,
    ).get('scheduled_to_cancel_at')
    const isCurrentSubscriptionScheduledToCancel =
        !!currentSubscriptionScheduledToCancelAt
    const currentSubscriptionProducts = useAppSelector(getCurrentPlansByProduct)

    // Selected product to Subscribe or Update
    const { selectedProduct } = useParams<Params>()
    const billingState = useBillingState()
    const {
        selectedPlans,
        setSelectedPlans,
        currentHelpdeskPlan,
        helpdeskAvailablePlans,
        currentAutomatePlan,
        automateAvailablePlans,
        automationInitialIndex,
        currentSmsPlan,
        smsAvailablePlans,
        smsInitialIndex,
        currentConvertPlan,
        convertAvailablePlans,
        convertInitialIndex,
        currentVoicePlan,
        voiceAvailablePlans,
        voiceInitialIndex,
        isEnterpriseHelpdeskPlanSelected,
        anyDowngradedPlanSelected,
        anyNewProductSelected,
        anyProductChanged,
        totalProductAmount,
        cadence,
        updateSubscription,
        startSubscription,
        isSubscriptionUpdating,
        autoUpgradeChanged,
    } = useBillingPlans({
        dispatchBillingError,
        selectedProduct,
        filterByCadence: true,
    })
    const history = useHistory()
    useEffect(() => {
        if (isYearlyContractPlan(currentHelpdeskPlan)) {
            history.push(BILLING_BASE_PATH)
        }
    }, [currentHelpdeskPlan, history])

    const shouldPayWithShopify = useAppSelector(getShouldPayWithShopify)

    const productCancellationsQuery = useProductCancellations()
    const cancellationsByPlanId = useMemo(
        () => productCancellationsQuery.data ?? new Map<string, string>(),
        [productCancellationsQuery.data],
    )
    const getScheduledCancellationPlanId = (
        cancellationsByPlanId: Map<PlanId, string>,
        plan?: AutomatePlan | SMSOrVoicePlan | ConvertPlan,
    ) => (plan ? cancellationsByPlanId.get(plan.plan_id) || null : null)
    const { totalCancelledAmount, cancelledProducts } = useMemo(() => {
        let result = 0
        const automatePlanId = getScheduledCancellationPlanId(
            cancellationsByPlanId,
            currentAutomatePlan,
        )
        const voicePlanId = getScheduledCancellationPlanId(
            cancellationsByPlanId,
            currentVoicePlan,
        )
        const smsPlanId = getScheduledCancellationPlanId(
            cancellationsByPlanId,
            currentSmsPlan,
        )
        const convertPlanId = getScheduledCancellationPlanId(
            cancellationsByPlanId,
            currentConvertPlan,
        )
        result += automatePlanId ? (currentAutomatePlan?.amount ?? 0) : 0
        result += voicePlanId ? (currentVoicePlan?.amount ?? 0) : 0
        result += smsPlanId ? (currentSmsPlan?.amount ?? 0) : 0
        result += convertPlanId ? (currentConvertPlan?.amount ?? 0) : 0
        const cancelledProducts: ProductType[] = []
        automatePlanId ? cancelledProducts.push(ProductType.Automation) : null
        voicePlanId ? cancelledProducts.push(ProductType.Voice) : null
        smsPlanId ? cancelledProducts.push(ProductType.SMS) : null
        convertPlanId ? cancelledProducts.push(ProductType.Convert) : null
        return {
            totalCancelledAmount: result,
            cancelledProducts: cancelledProducts,
        }
    }, [
        cancellationsByPlanId,
        currentAutomatePlan,
        currentVoicePlan,
        currentSmsPlan,
        currentConvertPlan,
    ])

    // on page unload, remove error notification
    useEffect(() => {
        return () => {
            dispatch(dismissNotification('billing-error'))
        }
    }, [dispatch])

    useEffectOnce(() => {
        logEvent(SegmentEvent.BillingProductManagementVisited, {
            url: pathname,
        })
    })

    const handlePendingChangesModalShow = useCallback(() => {
        logEvent(SegmentEvent.BillingUsageAndPlansPendingChangesModalShown)
    }, [])

    const messageForEnterprise = useMemo(() => {
        let message =
            "Hey Gorgias, I'd like to get a quote for the following bundle of products:\n"

        // Get selected plans' details
        Object.values(ProductType).map((key) => {
            const productType = key as ProductType
            const productName = _capitalize(key)
            const selectedPlan = selectedPlans[productType].plan
            const productInfo = getProductInfo(productType, selectedPlan)

            if (selectedPlans[productType]?.isSelected) {
                const isEnterprisePlan = isEnterprise(selectedPlan)
                const tickets = `${formatNumTickets(
                    selectedPlan?.num_quota_tickets ?? 0,
                )}${isEnterprisePlan ? '+' : ''}`

                message += `\n • ${productName} - ${tickets} ${
                    productInfo.counter
                }/${cadence} ${isEnterprisePlan ? '(Enterprise)' : ''}`
            }
        })

        return message
    }, [selectedPlans, cadence])

    if (hasCreditCard.isLoading || billingState.isFetching) return <Loader />

    const ctaText =
        isCurrentSubscriptionCanceled && hasCreditCard.data
            ? 'Subscribe now'
            : 'Update Subscription'

    const renderSummary = () => {
        if (
            currentSubscriptionScheduledToCancelAt &&
            currentSubscriptionProducts
        ) {
            return (
                <Card title={'Summary'}>
                    <ScheduledCancellationSummary
                        cancelledProducts={Object.values(ProductType)
                            .filter((type) =>
                                Object.hasOwn(
                                    currentSubscriptionProducts,
                                    type,
                                ),
                            )
                            .map(
                                (type) =>
                                    getProductInfo(
                                        type,
                                        currentSubscriptionProducts[type],
                                    ).title,
                            )}
                        scheduledToCancelAt={
                            currentSubscriptionScheduledToCancelAt
                        }
                        onContactUs={() =>
                            contactBilling(TicketPurpose.CONTACT_US)
                        }
                    />
                </Card>
            )
        }

        if (isEnterpriseHelpdeskPlanSelected) {
            return (
                <Card title="Enterprise Plan">
                    <div className={css.enterprisePlanText}>
                        To subscribe to our Enterprise plan, please get in touch
                        with our team.
                    </div>
                    <div className={css.enterprisePlanFooter}>
                        <Button
                            intent="primary"
                            onClick={() => {
                                logEvent(
                                    SegmentEvent.BillingUsageAndPlansEnterprisePlanContactUsClicked,
                                )
                                setDefaultMessage(messageForEnterprise)
                                setIsModalOpen(true)
                            }}
                        >
                            Contact Us
                        </Button>
                    </div>
                </Card>
            )
        }

        return (
            <Card title={'Summary'}>
                <div className={css.summary}>
                    <div className={css.summaryHeader}>
                        <div>PRODUCT</div>
                        <div>PRICE</div>
                    </div>
                    <SummaryItem
                        productType={ProductType.Helpdesk}
                        cadence={cadence}
                        currentPlan={currentHelpdeskPlan}
                        availablePlans={helpdeskAvailablePlans}
                        selectedPlans={selectedPlans}
                    />
                    <SummaryItem
                        productType={ProductType.Automation}
                        cadence={cadence}
                        currentPlan={currentAutomatePlan}
                        availablePlans={automateAvailablePlans}
                        selectedPlans={selectedPlans}
                        scheduledToCancelAt={getScheduledCancellationPlanId(
                            cancellationsByPlanId,
                            currentAutomatePlan,
                        )}
                    />
                    <SummaryItem
                        productType={ProductType.Voice}
                        cadence={cadence}
                        currentPlan={currentVoicePlan}
                        availablePlans={voiceAvailablePlans}
                        selectedPlans={selectedPlans}
                        scheduledToCancelAt={getScheduledCancellationPlanId(
                            cancellationsByPlanId,
                            currentVoicePlan,
                        )}
                    />
                    <SummaryItem
                        productType={ProductType.SMS}
                        cadence={cadence}
                        currentPlan={currentSmsPlan}
                        availablePlans={smsAvailablePlans}
                        selectedPlans={selectedPlans}
                        scheduledToCancelAt={getScheduledCancellationPlanId(
                            cancellationsByPlanId,
                            currentSmsPlan,
                        )}
                    />
                    <SummaryItem
                        productType={ProductType.Convert}
                        cadence={cadence}
                        currentPlan={currentConvertPlan}
                        availablePlans={convertAvailablePlans}
                        selectedPlans={selectedPlans}
                        scheduledToCancelAt={getScheduledCancellationPlanId(
                            cancellationsByPlanId,
                            currentConvertPlan,
                        )}
                    />
                    <SummaryTotal
                        selectedPlans={selectedPlans}
                        totalProductAmount={totalProductAmount}
                        totalCancelledAmount={totalCancelledAmount}
                        cancelledProducts={cancelledProducts}
                        cadence={cadence}
                        currency={helpdeskAvailablePlans?.[0].currency}
                    />
                </div>
                {!isTrialing && !isCurrentSubscriptionCanceled && (
                    <NewSummaryPaymentSection trackingSource="subscription_update" />
                )}
                <SummaryFooter
                    isPaymentEnabled={isPaymentEnabled}
                    isTrialing={isTrialing}
                    isCurrentSubscriptionCanceled={
                        isCurrentSubscriptionCanceled
                    }
                    anyProductChanged={anyProductChanged}
                    anyNewProductSelected={anyNewProductSelected}
                    anyDowngradedPlanSelected={!!anyDowngradedPlanSelected}
                    updateSubscription={() => {
                        logEvent(
                            SegmentEvent.BillingUsageAndPlansUpdateSubscriptionClicked,
                        )
                        return updateSubscription()
                    }}
                    startSubscription={startSubscription}
                    periodEnd={periodEnd}
                    selectedPlans={selectedPlans}
                    ctaText={ctaText}
                    hasCreditCard={hasCreditCard.data}
                    shouldPayWithShopify={shouldPayWithShopify}
                    isSubscriptionUpdating={isSubscriptionUpdating}
                    setUpdateProcessStarted={setUpdateProcessStarted}
                    autoUpgradeChanged={autoUpgradeChanged}
                    setSessionSelectedPlans={setSessionSelectedPlans}
                />
            </Card>
        )
    }

    return (
        <div className={css.container}>
            <div className={css.header}>
                <BackLink />
            </div>
            <VoiceOrSmsChangeReviewAlert
                selectedPlans={selectedPlans}
            ></VoiceOrSmsChangeReviewAlert>
            <div className={css.cards}>
                <Card
                    title={'Select Plans'}
                    link={{
                        url: PRICING_DETAILS_URL,
                        text: 'See Plans Details',
                        onClick: () => {
                            logEvent(
                                SegmentEvent.BillingUsageAndPlansSeePlansDetailsClicked,
                                { url: PRICING_DETAILS_URL },
                            )
                        },
                    }}
                >
                    <div className={css.products}>
                        <ProductPlanSelection
                            type={ProductType.Helpdesk}
                            customer={billingState.data?.customer}
                            cadence={cadence}
                            currentPlan={currentHelpdeskPlan}
                            availablePlans={helpdeskAvailablePlans}
                            selectedPlans={selectedPlans}
                            periodEnd={periodEnd}
                            isTrialing={isTrialing}
                            setSelectedPlans={setSelectedPlans}
                            editingAvailable={
                                !isCurrentSubscriptionScheduledToCancel
                            }
                            updateSubscription={updateSubscription}
                            scheduledToCancelAt={
                                currentHelpdeskPlan
                                    ? currentSubscriptionScheduledToCancelAt ||
                                      null
                                    : null
                            }
                            cancelledProducts={cancelledProducts}
                            contactBilling={contactBilling}
                        />
                        <div className={css.separator} />
                        <ProductPlanSelection
                            type={ProductType.Automation}
                            cadence={cadence}
                            currentPlan={currentAutomatePlan}
                            availablePlans={automateAvailablePlans}
                            selectedPlans={selectedPlans}
                            setSelectedPlans={setSelectedPlans}
                            initialIndex={automationInitialIndex}
                            periodEnd={periodEnd}
                            isTrialing={isTrialing}
                            currentUsage={currentUsage}
                            editingAvailable={
                                !isCurrentSubscriptionScheduledToCancel
                            }
                            updateSubscription={updateSubscription}
                            scheduledToCancelAt={
                                currentAutomatePlan
                                    ? currentSubscriptionScheduledToCancelAt ||
                                      cancellationsByPlanId.get(
                                          currentAutomatePlan.plan_id,
                                      )
                                    : null
                            }
                            cancelledProducts={cancelledProducts}
                            contactBilling={contactBilling}
                        />
                        <div className={css.separator} />
                        <ProductPlanSelection
                            type={ProductType.Voice}
                            cadence={cadence}
                            currentPlan={currentVoicePlan}
                            availablePlans={voiceAvailablePlans}
                            selectedPlans={selectedPlans}
                            setSelectedPlans={setSelectedPlans}
                            isTrialing={isTrialing}
                            periodEnd={periodEnd}
                            initialIndex={voiceInitialIndex}
                            editingAvailable={
                                !isCurrentSubscriptionScheduledToCancel
                            }
                            updateSubscription={updateSubscription}
                            scheduledToCancelAt={
                                currentVoicePlan
                                    ? currentSubscriptionScheduledToCancelAt ||
                                      cancellationsByPlanId.get(
                                          currentVoicePlan.plan_id,
                                      ) ||
                                      null
                                    : null
                            }
                            cancelledProducts={cancelledProducts}
                            contactBilling={contactBilling}
                        />
                        <div className={css.separator} />
                        <ProductPlanSelection
                            type={ProductType.SMS}
                            cadence={cadence}
                            currentPlan={currentSmsPlan}
                            availablePlans={smsAvailablePlans}
                            selectedPlans={selectedPlans}
                            setSelectedPlans={setSelectedPlans}
                            isTrialing={isTrialing}
                            periodEnd={periodEnd}
                            initialIndex={smsInitialIndex}
                            editingAvailable={
                                !isCurrentSubscriptionScheduledToCancel
                            }
                            updateSubscription={updateSubscription}
                            scheduledToCancelAt={
                                currentSmsPlan
                                    ? currentSubscriptionScheduledToCancelAt ||
                                      cancellationsByPlanId.get(
                                          currentSmsPlan.plan_id,
                                      ) ||
                                      null
                                    : null
                            }
                            cancelledProducts={cancelledProducts}
                            contactBilling={contactBilling}
                        />
                        <div className={css.separator} />
                        <ProductPlanSelection
                            type={ProductType.Convert}
                            cadence={cadence}
                            currentPlan={currentConvertPlan}
                            availablePlans={convertAvailablePlans}
                            selectedPlans={selectedPlans}
                            setSelectedPlans={setSelectedPlans}
                            isTrialing={isTrialing}
                            periodEnd={periodEnd}
                            initialIndex={convertInitialIndex}
                            editingAvailable={
                                !isCurrentSubscriptionScheduledToCancel
                            }
                            updateSubscription={updateSubscription}
                            scheduledToCancelAt={
                                currentConvertPlan
                                    ? currentSubscriptionScheduledToCancelAt ||
                                      cancellationsByPlanId.get(
                                          currentConvertPlan.plan_id,
                                      ) ||
                                      null
                                    : null
                            }
                            cancelledProducts={cancelledProducts}
                            contactBilling={contactBilling}
                        />
                    </div>
                </Card>
                {renderSummary()}
            </div>
            {!isCurrentSubscriptionScheduledToCancel && (
                <PendingChangesModal
                    onSave={
                        !isEnterpriseHelpdeskPlanSelected
                            ? () => {
                                  logEvent(
                                      SegmentEvent.BillingUsageAndPlansPendingChangesModalClick,
                                      { action: 'update' },
                                  )
                                  return updateSubscription()
                              }
                            : undefined
                    }
                    onDiscard={() => {
                        logEvent(
                            SegmentEvent.BillingUsageAndPlansPendingChangesModalClick,
                            { action: 'discard' },
                        )
                        setShowPendingChangesModal(false)
                    }}
                    onContinueEditing={() => {
                        logEvent(
                            SegmentEvent.BillingUsageAndPlansPendingChangesModalClick,
                            { action: 'back' },
                        )
                        setShowPendingChangesModal(false)
                    }}
                    onShow={handlePendingChangesModalShow}
                    when={anyProductChanged && !updateProcessStarted}
                    message='Your subscription changes will only be taken into account after you click "Update subscription"'
                    show={showPendingChangesModal}
                    title="Update subscription?"
                    saveText="Update subscription"
                    isSaving={isSubscriptionUpdating}
                />
            )}
        </div>
    )
}

export default BillingProcessView
