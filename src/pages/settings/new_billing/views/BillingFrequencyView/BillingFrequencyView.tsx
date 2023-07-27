import React, {useCallback, useEffect, useState} from 'react'

import {useHistory} from 'react-router-dom'
import Alert from 'pages/common/components/Alert/Alert'

import useAppSelector from 'hooks/useAppSelector'
import {creditCard} from 'state/billing/selectors'
import {PlanInterval, ProductType} from 'models/billing/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {fetchCreditCard} from 'state/billing/actions'
import {TicketPurpose} from 'state/billing/types'
import Card from '../../components/Card/Card'
import BackLink from '../../components/BackLink/BackLink'
import BillingFrequency from '../../components/BillingFrequency/BillingFrequency'
import SummaryItem from '../../components/SummaryItem/SummaryItem'
import SummaryTotal from '../../components/SummaryTotal/SummaryTotal'
import SummaryPaymentSection from '../../components/SummaryPaymentSection/SummaryPaymentSection'
import SummaryFooter from '../../components/SummaryFooter/SummaryFooter'
import {BILLING_PAYMENT_PATH, PRICING_DETAILS_URL} from '../../constants'
import {useBillingPlans} from '../../hooks/useBillingPlan'
import {getPriceForInterval} from '../../utils/getPriceForInterval'
import css from './BillingFrequencyView.less'

type BillingFrequencyViewProps = {
    contactBilling: (ticketPurpose: TicketPurpose) => void
    dispatchBillingError: () => void
    periodEnd: string
    isTrialing: boolean
}

const BillingFrequencyView = ({
    contactBilling,
    dispatchBillingError,
    periodEnd,
    isTrialing,
}: BillingFrequencyViewProps) => {
    const dispatch = useAppDispatch()
    const history = useHistory()

    const {
        helpdeskProduct,
        automationProduct,
        voiceProduct,
        smsProduct,
        helpdeskPrices,
        automationPrices,
        voicePrices,
        smsPrices,
        interval,
        selectedPlans,
        setSelectedPlans,
        totalProductAmount,
        anyProductChanged,
        updateSubscription,
    } = useBillingPlans({
        contactBilling,
        dispatchBillingError,
    })

    const [isPaymentEnabled, setIsPaymentEnabled] = useState(false)
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
                    plan: getPriceForInterval({
                        prices: helpdeskPrices,
                        interval,
                        currentPrice: helpdeskProduct,
                    }),
                },
                [ProductType.Automation]: {
                    ...prev[ProductType.Automation],
                    plan: getPriceForInterval({
                        prices: automationPrices,
                        interval,
                        currentPrice: automationProduct,
                    }),
                },
                [ProductType.Voice]: {
                    ...prev[ProductType.Voice],
                    plan: getPriceForInterval({
                        prices: voicePrices ?? [],
                        interval,
                        currentPrice: voiceProduct,
                    }),
                },
                [ProductType.SMS]: {
                    ...prev[ProductType.SMS],
                    plan: getPriceForInterval({
                        prices: smsPrices ?? [],
                        interval,
                        currentPrice: smsProduct,
                    }),
                },
            }))
        },
        [
            automationPrices,
            automationProduct,
            helpdeskPrices,
            helpdeskProduct,
            setSelectedInterval,
            setSelectedPlans,
            smsPrices,
            smsProduct,
            voicePrices,
            voiceProduct,
        ]
    )

    // redirect to the main page if yearly frequency is selected
    useEffect(() => {
        if (interval === PlanInterval.Year) {
            history.push(BILLING_PAYMENT_PATH)
        }
    }, [interval, history])

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
                            type={ProductType.Helpdesk}
                            interval={selectedInterval}
                            product={helpdeskProduct}
                            prices={helpdeskPrices}
                            selectedPlans={selectedPlans}
                            isFrequencyChanged={true}
                        />
                        <SummaryItem
                            type={ProductType.Automation}
                            interval={selectedInterval}
                            product={automationProduct}
                            prices={automationPrices}
                            selectedPlans={selectedPlans}
                            isFrequencyChanged={true}
                        />
                        <SummaryItem
                            type={ProductType.Voice}
                            interval={selectedInterval}
                            product={voiceProduct}
                            prices={voicePrices}
                            selectedPlans={selectedPlans}
                            isFrequencyChanged={true}
                        />
                        <SummaryItem
                            type={ProductType.SMS}
                            interval={selectedInterval}
                            product={smsProduct}
                            prices={smsPrices}
                            selectedPlans={selectedPlans}
                            isFrequencyChanged={true}
                        />
                        <SummaryTotal
                            selectedPlans={selectedPlans}
                            totalProductAmount={totalProductAmount}
                            interval={selectedInterval}
                            currency={helpdeskPrices?.[0].currency}
                            isFrequencyChanged={true}
                        />
                    </div>
                    {!isTrialing && (
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
                    />
                </Card>
            </div>
        </div>
    )
}

export default BillingFrequencyView
