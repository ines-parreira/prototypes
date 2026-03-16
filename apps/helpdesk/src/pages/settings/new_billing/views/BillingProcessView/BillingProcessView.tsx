import type React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { dismissNotification } from 'reapop'

import { useBillingState } from 'billing/hooks/useBillingState'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'
import { getProductInfo, isYearlyContractPlan } from 'models/billing/utils'
import Loader from 'pages/common/components/Loader/Loader'
import PendingChangesModal from 'pages/settings/helpCenter/components/PendingChangesModal/PendingChangesModal'
import { useIsPaymentEnabled } from 'pages/settings/new_billing/hooks/useIsPaymentEnabled'
import { useHasCreditCard } from 'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useHasCreditCard'
import { getCurrentPlansByProduct } from 'state/billing/selectors'
import type { CurrentProductsUsages } from 'state/billing/types'
import { TicketPurpose } from 'state/billing/types'
import { getCurrentSubscription } from 'state/currentAccount/selectors'

import BackLink from '../../components/BackLink'
import Card from '../../components/Card'
import ProductPlanSelection from '../../components/ProductPlanSelection'
import ScheduledCancellationSummary from '../../components/ScheduledCancellationSummary'
import VoiceOrSmsChangeReviewAlert from '../../components/VoiceOrSmsChangeReviewAlert'
import { BILLING_BASE_PATH, PRICING_DETAILS_URL } from '../../constants'
import { useBillingPlans } from '../../hooks/useBillingPlan'
import type { SelectedPlans } from '../../types'
import { BillingSummaryCard } from './BillingSummaryCard'
import { EnterprisePlanCard } from './EnterprisePlanCard'
import { useCancellationSummary } from './hooks/useCancellationSummary'
import { buildEnterpriseMessage } from './utils'

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

export const BillingProcessView = ({
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
    const currentSubscription = useAppSelector(getCurrentSubscription)
    const currentSubscriptionScheduledToCancelAt = currentSubscription.get(
        'scheduled_to_cancel_at',
    )
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
    const isBillingPaused = !!billingState.data?.subscription.is_paused

    const history = useHistory()
    useEffect(() => {
        if (isYearlyContractPlan(currentHelpdeskPlan) || isBillingPaused) {
            history.push(BILLING_BASE_PATH)
        }
    }, [currentHelpdeskPlan, isBillingPaused, history])

    const { cancellationDates, totalCancelledAmount, cancelledProducts } =
        useCancellationSummary({
            currentAutomatePlan,
            currentVoicePlan,
            currentSmsPlan,
            currentConvertPlan,
        })

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

    const messageForEnterprise = useMemo(
        () => buildEnterpriseMessage(selectedPlans, cadence),
        [selectedPlans, cadence],
    )

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
                <EnterprisePlanCard
                    messageForEnterprise={messageForEnterprise}
                    setDefaultMessage={setDefaultMessage}
                    setIsModalOpen={setIsModalOpen}
                />
            )
        }

        return (
            <BillingSummaryCard
                selectedPlans={selectedPlans}
                cadence={cadence}
                currentHelpdeskPlan={currentHelpdeskPlan}
                helpdeskAvailablePlans={helpdeskAvailablePlans}
                currentAutomatePlan={currentAutomatePlan}
                automateAvailablePlans={automateAvailablePlans}
                currentVoicePlan={currentVoicePlan}
                voiceAvailablePlans={voiceAvailablePlans}
                currentSmsPlan={currentSmsPlan}
                smsAvailablePlans={smsAvailablePlans}
                currentConvertPlan={currentConvertPlan}
                convertAvailablePlans={convertAvailablePlans}
                totalProductAmount={totalProductAmount}
                anyProductChanged={anyProductChanged}
                anyNewProductSelected={anyNewProductSelected}
                anyDowngradedPlanSelected={!!anyDowngradedPlanSelected}
                updateSubscription={updateSubscription}
                startSubscription={startSubscription}
                isSubscriptionUpdating={isSubscriptionUpdating}
                autoUpgradeChanged={autoUpgradeChanged}
                cancellationDates={cancellationDates}
                totalCancelledAmount={totalCancelledAmount}
                cancelledProducts={cancelledProducts}
                isTrialing={isTrialing}
                isCurrentSubscriptionCanceled={isCurrentSubscriptionCanceled}
                periodEnd={periodEnd}
                ctaText={ctaText}
                hasCreditCard={hasCreditCard.data}
                isPaymentEnabled={isPaymentEnabled}
                setUpdateProcessStarted={setUpdateProcessStarted}
                setSessionSelectedPlans={setSessionSelectedPlans}
            />
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
                                      cancellationDates[ProductType.Automation]
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
                                      cancellationDates[ProductType.Voice] ||
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
                                      cancellationDates[ProductType.SMS] ||
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
                                      cancellationDates[ProductType.Convert] ||
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
