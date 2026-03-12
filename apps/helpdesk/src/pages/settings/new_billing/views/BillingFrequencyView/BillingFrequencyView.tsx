import { useCallback, useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useHistory, useLocation } from 'react-router-dom'

import { ObjectFromEnum } from 'billing/helpers/objectFromEnum'
import { useBillingState } from 'billing/hooks/useBillingState'
import type { Plan } from 'models/billing/types'
import { Cadence, ProductType } from 'models/billing/types'
import { isOtherCadenceUpgrade } from 'models/billing/utils'
import Alert from 'pages/common/components/Alert/Alert'
import Loader from 'pages/common/components/Loader/Loader'
import { NewSummaryPaymentSection } from 'pages/settings/new_billing/components/SummaryPaymentSection/NewSummaryPaymentSection'
import { useIsPaymentEnabled } from 'pages/settings/new_billing/hooks/useIsPaymentEnabled'
import useProductCancellations from 'pages/settings/new_billing/hooks/useProductCancellations'
import { getCorrespondingPlanAtCadence } from 'pages/settings/new_billing/utils/getCorrespondingPlanAtCadence'
import type { TicketPurpose } from 'state/billing/types'

import BackLink from '../../components/BackLink/BackLink'
import BillingFrequency from '../../components/BillingFrequency/BillingFrequency'
import Card from '../../components/Card/Card'
import SummaryFooter from '../../components/SummaryFooter/SummaryFooter'
import { SummaryItem } from '../../components/SummaryItem/SummaryItem'
import SummaryTotal from '../../components/SummaryTotal/SummaryTotal'
import { BILLING_PAYMENT_PATH, PRICING_DETAILS_URL } from '../../constants'
import { useBillingPlans } from '../../hooks/useBillingPlan'
import type { SelectedPlans } from '../../types'

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
        dispatchBillingError,
    })

    const productCancellationsQuery = useProductCancellations()
    const cancellationsByPlanId = productCancellationsQuery.data ?? new Map()

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
            cancellationsByPlanId.size > 0 ||
            isBillingPaused
        ) {
            history.push(BILLING_PAYMENT_PATH)
        }
    }, [
        cadence,
        canUseQuarterlyBilling,
        isCurrentSubscriptionCanceled,
        cancellationsByPlanId.size,
        isBillingPaused,
        history,
    ])

    if (billingState.isLoading) {
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
                        updateSubscription={() => {
                            logEvent(
                                SegmentEvent.BillingPaymentInformationSubscriptionFrequencyUpdated,
                            )
                            return updateSubscription()
                        }}
                        periodEnd={periodEnd}
                        ctaText="Update Subscription"
                        isSubscriptionUpdating={isSubscriptionUpdating}
                    />
                </Card>
            </div>
        </div>
    )
}

export default BillingFrequencyView
