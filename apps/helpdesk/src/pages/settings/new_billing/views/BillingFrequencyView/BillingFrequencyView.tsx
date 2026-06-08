import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import type { SelectedPlans } from '@repo/billing'
import {
    BILLING_BASE_PATH,
    BILLING_PAYMENT_CARD_PATH,
    BILLING_PAYMENT_PATH,
    buildPlansByProduct,
    getCorrespondingPlanAtCadence,
    PRICING_DETAILS_URL,
    useBillingState,
} from '@repo/billing'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import { logEvent, reportError, SegmentEvent } from '@repo/logging'
import { useHistory, useLocation } from 'react-router-dom'

import { toast } from '@gorgias/axiom'

import { ObjectFromEnum } from 'billing/helpers/objectFromEnum'
import type { Plan } from 'models/billing/types'
import { Cadence, ProductType } from 'models/billing/types'
import { isOtherCadenceUpgrade } from 'models/billing/utils'
import Alert from 'pages/common/components/Alert/Alert'
import Loader from 'pages/common/components/Loader/Loader'
import { NewSummaryPaymentSection } from 'pages/settings/new_billing/components/SummaryPaymentSection/NewSummaryPaymentSection'
import { useIsPaymentEnabled } from 'pages/settings/new_billing/hooks/useIsPaymentEnabled'
import { useIsPaymentMethodMissing } from 'pages/settings/new_billing/hooks/useIsPaymentMethodMissing'
import useProductCancellations from 'pages/settings/new_billing/hooks/useProductCancellations'
import type { TicketPurpose } from 'state/billing/types'

import BackLink from '../../components/BackLink/BackLink'
import BillingFrequency from '../../components/BillingFrequency/BillingFrequency'
import Card from '../../components/Card/Card'
import { ConfirmChangesModal } from '../../components/ConfirmChangesModal'
import SummaryFooter from '../../components/SummaryFooter/SummaryFooter'
import { SummaryItem } from '../../components/SummaryItem/SummaryItem'
import SummaryTotal from '../../components/SummaryTotal/SummaryTotal'
import { useBillingPlans } from '../../hooks/useBillingPlan'
import { isPendingInvoiceError } from '../../utils/isPendingInvoiceError'
import { isVersionConflictError } from '../../utils/isVersionConflictError'

import css from './BillingFrequencyView.less'

type BillingFrequencyViewProps = {
    contactBilling: (ticketPurpose: TicketPurpose) => void
    dispatchBillingError: (error: unknown) => void
    periodEnd: string
    isTrialing: boolean
    isCurrentSubscriptionCanceled: boolean
}

export type PlanByProductType = { [key in ProductType]: Plan | undefined }
export type PlansByProductType = { [key in ProductType]: Plan[] }
export type PlanByProductTypeByCadence = { [key in Cadence]: PlanByProductType }

const BillingFrequencyView = ({
    dispatchBillingError,
    periodEnd,
    isTrialing,
    isCurrentSubscriptionCanceled,
}: BillingFrequencyViewProps) => {
    const history = useHistory()
    const billingState = useBillingState()

    const isBillingPaused = !!billingState.data?.subscription.is_paused
    const { pathname } = useLocation()

    useEffectOnce(() => {
        logEvent(
            SegmentEvent.BillingPaymentInformationBillingFrequencyVisited,
            {
                url: pathname,
            },
        )
    })

    const isMidCycleUpgradeEnabled = useFlag(
        FeatureFlagKey.MidCycleUpgradeBillingLogic,
    )

    const {
        currentHelpdeskPlan,
        currentAutomatePlan,
        currentVoicePlan,
        currentSmsPlan,
        currentConvertPlan,
        helpdeskAvailablePlans,
        automateAvailablePlans,
        voiceAvailablePlans,
        smsAvailablePlans,
        convertAvailablePlans,
        cadence,
        selectedPlans,
        setSelectedPlans,
        totalProductAmount,
        anyProductChanged,
        updateSubscription,
        isSubscriptionUpdating,
    } = useBillingPlans({
        // Flag-on: handleSubmit owns error surfacing (banner for typed errors,
        // dispatchBillingError for the rest). No-op here avoids double-dispatch.
        dispatchBillingError: isMidCycleUpgradeEnabled
            ? () => {}
            : dispatchBillingError,
        subscriptionResourceVersion:
            billingState.data?.subscription.resource_version,
        subscriptionRenewalRampResourceVersion:
            billingState.data?.subscription.schedule_resource_version ??
            undefined,
    })

    const productCancellationsQuery = useProductCancellations()
    const cancellationsByPlanId = productCancellationsQuery.data ?? new Map()
    // scheduled_changes is the canonical source — scheduled cancellations
    // also land here. Blocks the frequency view while another change is in flight.
    const hasScheduledChanges =
        (billingState.data?.subscription?.scheduled_changes?.length ?? 0) > 0

    const {
        currentPlans,
        availablePlans,
        allPlansByProductTypeByCadence,
        disabledCadences,
    } = useMemo(() => {
        const currentPlans: PlanByProductType = {
            [ProductType.Helpdesk]: currentHelpdeskPlan,
            [ProductType.Automation]: currentAutomatePlan,
            [ProductType.Voice]: currentVoicePlan,
            [ProductType.SMS]: currentSmsPlan,
            [ProductType.Convert]: currentConvertPlan,
        }

        const availablePlans: PlansByProductType = {
            [ProductType.Helpdesk]: helpdeskAvailablePlans,
            [ProductType.Automation]: automateAvailablePlans,
            [ProductType.Voice]: voiceAvailablePlans,
            [ProductType.SMS]: smsAvailablePlans,
            [ProductType.Convert]: convertAvailablePlans,
        }

        const allPlansByProductTypeByCadence = ObjectFromEnum<
            typeof Cadence,
            PlanByProductTypeByCadence
        >(Cadence, (otherCadence: Cadence) =>
            ObjectFromEnum<typeof ProductType, PlanByProductType>(
                ProductType,
                (productType: ProductType) =>
                    otherCadence === cadence
                        ? currentPlans[productType]
                        : getCorrespondingPlanAtCadence({
                              availablePlans: availablePlans[productType],
                              cadence: otherCadence,
                              currentPlan: currentPlans[productType],
                          }),
            ),
        )

        const disabledCadences = new Set<Cadence>(
            Object.values(Cadence)
                .filter((otherCadence) => otherCadence !== cadence)
                .filter((otherCadence: Cadence) =>
                    Object.values(ProductType)
                        .filter((productType) => !!currentPlans[productType])
                        .map(
                            (productType: ProductType) =>
                                allPlansByProductTypeByCadence[otherCadence][
                                    productType
                                ],
                        )
                        .reduce(
                            (isMissing: boolean, plan) =>
                                isMissing || plan === undefined,
                            false,
                        ),
                ),
        )

        return {
            currentPlans,
            availablePlans,
            allPlansByProductTypeByCadence,
            disabledCadences,
        }
    }, [
        cadence,
        currentHelpdeskPlan,
        currentAutomatePlan,
        currentVoicePlan,
        currentSmsPlan,
        currentConvertPlan,
        helpdeskAvailablePlans,
        automateAvailablePlans,
        voiceAvailablePlans,
        smsAvailablePlans,
        convertAvailablePlans,
    ])

    const isPaymentEnabled = !!useIsPaymentEnabled()

    const [showAlert, setShowAlert] = useState(true)
    const [selectedCadence, setSelectedCadence] = useState<Cadence>(cadence)
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
    const [hasPendingInvoiceError, setHasPendingInvoiceError] = useState(false)
    const [hasVersionConflictError, setHasVersionConflictError] =
        useState(false)

    const isPaymentMethodMissing = useIsPaymentMethodMissing({
        isActiveSubscription: !isTrialing && !isCurrentSubscriptionCanceled,
    })

    const plansByProduct = useMemo(
        () =>
            buildPlansByProduct(
                {
                    helpdesk: currentHelpdeskPlan,
                    automation: currentAutomatePlan,
                    voice: currentVoicePlan,
                    sms: currentSmsPlan,
                    convert: currentConvertPlan,
                },
                {
                    helpdesk: helpdeskAvailablePlans,
                    automation: automateAvailablePlans,
                    voice: voiceAvailablePlans,
                    sms: smsAvailablePlans,
                    convert: convertAvailablePlans,
                },
            ),
        [
            currentHelpdeskPlan,
            currentAutomatePlan,
            currentVoicePlan,
            currentSmsPlan,
            currentConvertPlan,
            helpdeskAvailablePlans,
            automateAvailablePlans,
            voiceAvailablePlans,
            smsAvailablePlans,
            convertAvailablePlans,
        ],
    )

    const onFrequencySelect = useCallback(
        (selectedCadence: Cadence) => {
            setSelectedCadence(selectedCadence)

            setSelectedPlans((prev: SelectedPlans) => ({
                ...prev,
                ...ObjectFromEnum<typeof ProductType, SelectedPlans>(
                    ProductType,
                    <K extends ProductType>(
                        productType: K,
                    ): SelectedPlans[K] => ({
                        ...prev[productType],
                        plan: allPlansByProductTypeByCadence[selectedCadence][
                            productType
                        ],
                    }),
                ),
            }))
        },
        [allPlansByProductTypeByCadence, setSelectedCadence, setSelectedPlans],
    )

    // Track frequency changes
    useEffect(() => {
        if (selectedCadence !== cadence) {
            logEvent(SegmentEvent.BillingPaymentInformationFrequencyChanged, {
                cadence: selectedCadence,
            })
        }
    }, [selectedCadence, cadence])

    // redirect to the main page if no upgrades are possible or subscription is canceled
    const canUseQuarterlyBilling =
        useFlag(FeatureFlagKey.BillingQuarterlyFrequency) ||
        cadence === Cadence.Quarter

    useEffect(() => {
        const cadenceValues = Object.values(Cadence).filter(
            (cadence: Cadence) =>
                cadence !== Cadence.Quarter || canUseQuarterlyBilling,
        )
        const cadenceUpgradeIsPossible =
            cadenceValues.find(
                (otherCadence: Cadence) =>
                    (cadence !== Cadence.Quarter || canUseQuarterlyBilling) &&
                    isOtherCadenceUpgrade(cadence, otherCadence),
            ) !== undefined

        if (
            !cadenceUpgradeIsPossible ||
            isCurrentSubscriptionCanceled ||
            (isMidCycleUpgradeEnabled
                ? hasScheduledChanges
                : cancellationsByPlanId.size > 0) ||
            isBillingPaused
        ) {
            history.push(BILLING_PAYMENT_PATH)
        }
    }, [
        cadence,
        canUseQuarterlyBilling,
        isCurrentSubscriptionCanceled,
        cancellationsByPlanId.size,
        hasScheduledChanges,
        isBillingPaused,
        history,
        isMidCycleUpgradeEnabled,
    ])

    function resetModalErrors() {
        setHasPendingInvoiceError(false)
        setHasVersionConflictError(false)
    }

    async function handleSubmit(): Promise<boolean> {
        logEvent(
            SegmentEvent.BillingPaymentInformationSubscriptionFrequencyUpdated,
        )
        try {
            resetModalErrors()
            await updateSubscription()
            toast.success('Your subscription has successfully been updated.', {
                duration: Duration.seconds(5),
            })
            history.push(
                isTrialing ? BILLING_PAYMENT_CARD_PATH : BILLING_BASE_PATH,
            )
            return true
        } catch (error) {
            if (isPendingInvoiceError(error)) {
                setHasPendingInvoiceError(true)
            } else if (isVersionConflictError(error)) {
                setHasVersionConflictError(true)
            } else {
                reportError(
                    error instanceof Error ? error : new Error(String(error)),
                )
                dispatchBillingError(error)
            }
            return false
        }
    }

    async function handleConfirm() {
        const success = await handleSubmit()
        if (success) {
            setIsConfirmModalOpen(false)
        }
    }

    function handleCloseConfirmModal() {
        setIsConfirmModalOpen(false)
        resetModalErrors()
    }

    const subscription = billingState.data?.subscription

    // Gated on the mid-cycle flag: pairs with the `!subscription` loader guard
    // below so a failed billing-state load surfaces the Contact Billing toast
    // instead of hanging. Flag-off preserves main's silent behavior.
    // Ref-guard dedupes in case `dispatchBillingError` isn't memoized upstream
    // or React Query retries produce additional renders with the same error.
    const dispatchedErrorRef = useRef<unknown>(null)
    useEffect(() => {
        if (!isMidCycleUpgradeEnabled) return
        if (!billingState.isError || !billingState.error) {
            dispatchedErrorRef.current = null
            return
        }
        if (dispatchedErrorRef.current === billingState.error) return
        dispatchedErrorRef.current = billingState.error
        dispatchBillingError(billingState.error)
    }, [
        isMidCycleUpgradeEnabled,
        billingState.isError,
        billingState.error,
        dispatchBillingError,
    ])

    if (billingState.isLoading) {
        return <Loader />
    }
    // Mid-cycle flow requires resource versions from subscription. If
    // unavailable (fetch error), keep blocking the submit surface — the
    // error has already been surfaced via dispatchBillingError.
    if (isMidCycleUpgradeEnabled && !subscription) {
        return <Loader />
    }

    return (
        <div className={css.container}>
            <BackLink />
            {showAlert && (
                <Alert icon onClose={() => setShowAlert(false)}>
                    Changing your billing frequency will apply on all your
                    subscribed products
                </Alert>
            )}
            <div className={css.cards}>
                <Card
                    title="Billing frequency"
                    link={{
                        url: PRICING_DETAILS_URL,
                        text: 'See Plans Details',
                    }}
                >
                    <BillingFrequency
                        currentCadence={cadence}
                        selectedCadence={selectedCadence}
                        allowDowngrades={false}
                        onCadenceSelect={onFrequencySelect}
                        disabledCadences={disabledCadences}
                    />
                </Card>
                <Card title="Summary">
                    <div className={css.summary}>
                        <div className={css.summaryHeader}>
                            <div>PRODUCT</div>
                            <div>PRICE</div>
                        </div>
                        {Object.values(ProductType).map(
                            (productType: ProductType) => (
                                <SummaryItem
                                    key={productType}
                                    productType={productType}
                                    cadence={selectedCadence}
                                    currentPlan={currentPlans[productType]}
                                    availablePlans={availablePlans[productType]}
                                    selectedPlans={selectedPlans}
                                    isFrequencyChanged={true}
                                />
                            ),
                        )}
                        <SummaryTotal
                            selectedPlans={selectedPlans}
                            totalProductAmount={totalProductAmount}
                            cadence={selectedCadence}
                            currency={helpdeskAvailablePlans?.[0]?.currency}
                            isFrequencyChanged={true}
                        />
                    </div>
                    {!isTrialing && (
                        <NewSummaryPaymentSection trackingSource="billing_frequency" />
                    )}
                    <SummaryFooter
                        isPaymentEnabled={isPaymentEnabled}
                        isTrialing={isTrialing}
                        anyProductChanged={anyProductChanged}
                        anyNewProductSelected={false}
                        anyDowngradedPlanSelected={false}
                        onOpenConfirmationModal={
                            isMidCycleUpgradeEnabled
                                ? () => setIsConfirmModalOpen(true)
                                : undefined
                        }
                        updateSubscription={
                            isMidCycleUpgradeEnabled
                                ? undefined
                                : () => {
                                      logEvent(
                                          SegmentEvent.BillingPaymentInformationSubscriptionFrequencyUpdated,
                                      )
                                      return updateSubscription()
                                  }
                        }
                        periodEnd={periodEnd}
                        ctaText="Update Subscription"
                        isSubscriptionUpdating={isSubscriptionUpdating}
                    />
                    {isMidCycleUpgradeEnabled && subscription && (
                        <ConfirmChangesModal
                            isOpen={isConfirmModalOpen}
                            onClose={handleCloseConfirmModal}
                            onConfirm={() => {
                                void handleConfirm()
                            }}
                            isConfirming={isSubscriptionUpdating}
                            selectedPlans={selectedPlans}
                            cadence={selectedCadence}
                            periodEnd={periodEnd}
                            plansByProduct={plansByProduct}
                            totalProductAmount={totalProductAmount}
                            // Cadence-only flow: no cancellations possible here.
                            totalCancelledAmount={0}
                            cancelledProducts={[]}
                            currency={
                                helpdeskAvailablePlans?.[0]?.currency ?? 'usd'
                            }
                            subscriptionResourceVersion={
                                subscription.resource_version
                            }
                            subscriptionRenewalRampResourceVersion={
                                subscription.schedule_resource_version ??
                                undefined
                            }
                            pendingInvoiceError={hasPendingInvoiceError}
                            versionConflictError={hasVersionConflictError}
                            isPaymentMethodMissing={isPaymentMethodMissing}
                        />
                    )}
                </Card>
            </div>
        </div>
    )
}

export default BillingFrequencyView
