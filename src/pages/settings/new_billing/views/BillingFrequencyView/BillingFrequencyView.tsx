import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useCallback, useEffect, useState} from 'react'

import {useHistory} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {PlanInterval, ProductType} from 'models/billing/types'
import Alert from 'pages/common/components/Alert/Alert'

import {NewSummaryPaymentSection} from 'pages/settings/new_billing/components/SummaryPaymentSection/NewSummaryPaymentSection'
import {useIsPaymentEnabled} from 'pages/settings/new_billing/hooks/useIsPaymentEnabled'
import {getCorrespondingPlanAtInterval} from 'pages/settings/new_billing/utils/getCorrespondingPlanAtInterval'
import {fetchCreditCard} from 'state/billing/actions'
import {creditCard} from 'state/billing/selectors'
import {TicketPurpose} from 'state/billing/types'

import BackLink from '../../components/BackLink/BackLink'
import BillingFrequency from '../../components/BillingFrequency/BillingFrequency'
import Card from '../../components/Card/Card'
import SummaryFooter from '../../components/SummaryFooter/SummaryFooter'
import SummaryItem from '../../components/SummaryItem/SummaryItem'
import SummaryPaymentSection from '../../components/SummaryPaymentSection/SummaryPaymentSection'
import SummaryTotal from '../../components/SummaryTotal/SummaryTotal'
import {BILLING_PAYMENT_PATH, PRICING_DETAILS_URL} from '../../constants'
import {useBillingPlans} from '../../hooks/useBillingPlan'
import css from './BillingFrequencyView.less'

type BillingFrequencyViewProps = {
    contactBilling: (ticketPurpose: TicketPurpose) => void
    dispatchBillingError: () => void
    periodEnd: string
    isTrialing: boolean
    isCurrentSubscriptionCanceled: boolean
}

const BillingFrequencyView = ({
    dispatchBillingError,
    periodEnd,
    isTrialing,
    isCurrentSubscriptionCanceled,
}: BillingFrequencyViewProps) => {
    const dispatch = useAppDispatch()
    const history = useHistory()

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
        interval,
        selectedPlans,
        setSelectedPlans,
        totalProductAmount,
        anyProductChanged,
        updateSubscription,
        isSubscriptionUpdating,
    } = useBillingPlans({
        dispatchBillingError,
    })

    const [oldIsPaymentEnabled, setIsPaymentEnabled] = useState(false)
    const newIsPaymentEnabled = !!useIsPaymentEnabled()
    const isPaymentEnabled = oldIsPaymentEnabled || newIsPaymentEnabled

    const [showAlert, setShowAlert] = useState(true)

    const card = useAppSelector(creditCard)

    const [selectedInterval, setSelectedInterval] =
        useState<PlanInterval>(interval)

    const [isCreditCardFetched, setIsCreditCardFetched] = useState(false)

    const onFrequencySelect = useCallback(
        (interval: PlanInterval) => {
            setSelectedInterval(interval)

            setSelectedPlans((prev) => ({
                ...prev,
                [ProductType.Helpdesk]: {
                    ...prev[ProductType.Helpdesk],
                    plan: getCorrespondingPlanAtInterval({
                        availablePlans: helpdeskAvailablePlans,
                        interval,
                        currentPlan: currentHelpdeskPlan,
                    }),
                },
                [ProductType.Automation]: {
                    ...prev[ProductType.Automation],
                    plan: getCorrespondingPlanAtInterval({
                        availablePlans: automateAvailablePlans,
                        interval,
                        currentPlan: currentAutomatePlan,
                    }),
                },
                [ProductType.Voice]: {
                    ...prev[ProductType.Voice],
                    plan: getCorrespondingPlanAtInterval({
                        availablePlans: voiceAvailablePlans ?? [],
                        interval,
                        currentPlan: currentVoicePlan,
                    }),
                },
                [ProductType.SMS]: {
                    ...prev[ProductType.SMS],
                    plan: getCorrespondingPlanAtInterval({
                        availablePlans: smsAvailablePlans ?? [],
                        interval,
                        currentPlan: currentSmsPlan,
                    }),
                },
                [ProductType.Convert]: {
                    ...prev[ProductType.Convert],
                    plan: getCorrespondingPlanAtInterval({
                        availablePlans: convertAvailablePlans ?? [],
                        interval,
                        currentPlan: currentConvertPlan,
                    }),
                },
            }))
        },
        [
            automateAvailablePlans,
            currentAutomatePlan,
            helpdeskAvailablePlans,
            currentHelpdeskPlan,
            setSelectedInterval,
            setSelectedPlans,
            smsAvailablePlans,
            currentSmsPlan,
            convertAvailablePlans,
            currentConvertPlan,
            voiceAvailablePlans,
            currentVoicePlan,
        ]
    )

    // redirect to the main page if yearly frequency is selected or subscription is canceled
    useEffect(() => {
        if (interval === PlanInterval.Year || isCurrentSubscriptionCanceled) {
            history.push(BILLING_PAYMENT_PATH)
        }
    }, [interval, isCurrentSubscriptionCanceled, history])

    // fetch card
    useEffect(() => {
        const fetchCard = async () => {
            if (!card.get('brand')) {
                await dispatch(fetchCreditCard())
            }
            setIsCreditCardFetched(true)
        }

        void fetchCard()
    }, [card, dispatch])

    const isNewSummaryPaymentSectionON =
        !!useFlags()[FeatureFlagKey.BillingNewSummaryPaymentSection]

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
                        selectedInterval={selectedInterval}
                        onFrequencySelect={onFrequencySelect}
                    />
                </Card>
                <Card title="Summary">
                    <div className={css.summary}>
                        <div className={css.summaryHeader}>
                            <div>PRODUCT</div>
                            <div>PRICE</div>
                        </div>
                        <SummaryItem
                            productType={ProductType.Helpdesk}
                            interval={selectedInterval}
                            currentPlan={currentHelpdeskPlan}
                            availablePlans={helpdeskAvailablePlans}
                            selectedPlans={selectedPlans}
                            isFrequencyChanged={true}
                        />
                        <SummaryItem
                            productType={ProductType.Automation}
                            interval={selectedInterval}
                            currentPlan={currentAutomatePlan}
                            availablePlans={automateAvailablePlans}
                            selectedPlans={selectedPlans}
                            isFrequencyChanged={true}
                        />
                        <SummaryItem
                            productType={ProductType.Voice}
                            interval={selectedInterval}
                            currentPlan={currentVoicePlan}
                            availablePlans={voiceAvailablePlans}
                            selectedPlans={selectedPlans}
                            isFrequencyChanged={true}
                        />
                        <SummaryItem
                            productType={ProductType.SMS}
                            interval={selectedInterval}
                            currentPlan={currentSmsPlan}
                            availablePlans={smsAvailablePlans}
                            selectedPlans={selectedPlans}
                            isFrequencyChanged={true}
                        />
                        <SummaryItem
                            productType={ProductType.Convert}
                            interval={selectedInterval}
                            currentPlan={currentConvertPlan}
                            availablePlans={convertAvailablePlans}
                            selectedPlans={selectedPlans}
                            isFrequencyChanged={true}
                        />
                        <SummaryTotal
                            selectedPlans={selectedPlans}
                            totalProductAmount={totalProductAmount}
                            interval={selectedInterval}
                            currency={helpdeskAvailablePlans?.[0].currency}
                            isFrequencyChanged={true}
                        />
                    </div>
                    {!isTrialing && isNewSummaryPaymentSectionON ? (
                        <NewSummaryPaymentSection />
                    ) : (
                        <SummaryPaymentSection
                            setIsPaymentEnabled={setIsPaymentEnabled}
                            isCreditCardFetched={isCreditCardFetched}
                        />
                    )}
                    <SummaryFooter
                        isPaymentEnabled={isPaymentEnabled}
                        isTrialing={isTrialing}
                        anyProductChanged={anyProductChanged}
                        anyNewProductSelected={false}
                        anyDowngradedPlanSelected={false}
                        updateSubscription={updateSubscription}
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
