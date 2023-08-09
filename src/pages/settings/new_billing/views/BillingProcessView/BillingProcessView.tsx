import React, {useEffect, useMemo, useState} from 'react'
import {useParams} from 'react-router-dom'
import {dismissNotification} from 'reapop'

import {
    AutomationPrice,
    HelpdeskPrice,
    ProductType,
    SMSOrVoicePrice,
} from 'models/billing/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {fetchCreditCard} from 'state/billing/actions'
import Button from 'pages/common/components/button/Button'
import {TicketPurpose} from 'state/billing/types'
import Alert from 'pages/common/components/Alert/Alert'
import Card from '../../components/Card'
import BackLink from '../../components/BackLink'
import ProductPlanSelection from '../../components/ProductPlanSelection'
import SummaryItem from '../../components/SummaryItem'
import SummaryTotal from '../../components/SummaryTotal'
import SummaryPaymentSection from '../../components/SummaryPaymentSection'
import SummaryFooter from '../../components/SummaryFooter'
import {
    ENTERPRISE_PRICE_ID,
    PRICING_DETAILS_URL,
    PRODUCT_INFO,
} from '../../constants'

import {formatNumTickets} from '../../utils/formatAmount'
import {useBillingPlans} from '../../hooks/useBillingPlan'
import css from './BillingProcessView.less'

type Params = {
    selectedProduct: ProductType
}

type BillingProcessViewProps = {
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    contactBilling: (ticketPurpose: TicketPurpose) => void
    setDefaultMessage: React.Dispatch<React.SetStateAction<string>>
    dispatchBillingError: () => void
    isTrialing: boolean
    periodEnd: string
}

export type SelectedPlans = {
    [ProductType.Helpdesk]: {
        plan?: HelpdeskPrice
        isSelected: boolean
    }
    [ProductType.Automation]: {
        plan?: AutomationPrice
        isSelected: boolean
    }
    [ProductType.Voice]: {
        plan?: SMSOrVoicePrice
        isSelected: boolean
    }
    [ProductType.SMS]: {
        plan?: SMSOrVoicePrice
        isSelected: boolean
    }
}

const BillingProcessView = ({
    setIsModalOpen,
    contactBilling,
    setDefaultMessage,
    dispatchBillingError,
    isTrialing,
    periodEnd,
}: BillingProcessViewProps) => {
    const dispatch = useAppDispatch()
    const [isPaymentEnabled, setIsPaymentEnabled] = useState(false)
    const [isCreditCardFetched, setIsCreditCardFetched] = useState(false)

    // Selected product to Subscribe or Update
    const {selectedProduct} = useParams<Params>()

    const {
        selectedPlans,
        setSelectedPlans,
        helpdeskProduct,
        helpdeskPrices,
        automationProduct,
        automationPrices,
        automationInitialIndex,
        smsProduct,
        smsPrices,
        voiceProduct,
        voicePrices,
        isEnterpriseHelpdeskPlanSelected,
        isStarterHelpdeskPlanSelected,
        anyDowngradedPlanSelected,
        anyNewProductSelected,
        anyProductChanged,
        totalProductAmount,
        interval,
        updateSubscription,
    } = useBillingPlans({
        contactBilling,
        dispatchBillingError,
        selectedProduct,
        filterByInterval: true,
    })

    const voiceOrSMSChanged =
        (selectedPlans[ProductType.Voice].isSelected &&
            voiceProduct?.price_id !==
                selectedPlans[ProductType.Voice].plan?.price_id) ||
        (selectedPlans[ProductType.SMS].isSelected &&
            smsProduct?.price_id !==
                selectedPlans[ProductType.SMS].plan?.price_id)

    // fetch card
    useEffect(() => {
        const fetchCard = async () => {
            await dispatch(fetchCreditCard())
            setIsCreditCardFetched(true)
        }

        void fetchCard()
    }, [dispatch])

    // on page unload, remove error notification
    useEffect(() => {
        return () => {
            dispatch(dismissNotification('billing-error'))
        }
    }, [dispatch])

    const messageForEnterprise = useMemo(() => {
        let message =
            "Hey Gorgias, I'd like to get a quote for the following bundle of products:\n"

        // Get selected plans' details
        Object.values(ProductType).map((key) => {
            const productType = key as ProductType
            const productName = key.charAt(0).toUpperCase() + key.slice(1)
            const selectedPlan = selectedPlans[productType].plan

            if (selectedPlans[productType]?.isSelected) {
                const isEnterprisePlan =
                    selectedPlan?.price_id === ENTERPRISE_PRICE_ID
                const tickets = `${formatNumTickets(
                    selectedPlan?.num_quota_tickets ?? 0
                )}${isEnterprisePlan ? '+' : ''}`

                message += `\n • ${productName} - ${tickets} ${
                    PRODUCT_INFO[productType].counter
                }/${interval} ${isEnterprisePlan ? '(Enterprise)' : ''}`
            }
        })

        return message
    }, [selectedPlans, interval])

    const voiceOrSMSText = useMemo(() => {
        if (
            selectedPlans[ProductType.Voice].isSelected &&
            selectedPlans[ProductType.SMS].isSelected
        ) {
            return 'Voice & SMS'
        } else if (selectedPlans[ProductType.SMS].isSelected) {
            return 'SMS'
        }
        return 'Voice'
    }, [selectedPlans])

    return (
        <div className={css.container}>
            <div className={css.header}>
                <BackLink />
            </div>
            {voiceOrSMSChanged && (
                <Alert className={css.alert} icon>
                    Your {voiceOrSMSText} subscription will have to be reviewed
                    by our team before you can start using it
                </Alert>
            )}
            <div className={css.cards}>
                <Card
                    title={'Select Plans'}
                    link={{
                        url: PRICING_DETAILS_URL,
                        text: 'See Plans Details',
                    }}
                >
                    <div className={css.products}>
                        <ProductPlanSelection
                            type={ProductType.Helpdesk}
                            interval={interval}
                            product={helpdeskProduct}
                            prices={helpdeskPrices}
                            selectedPlans={selectedPlans}
                            setSelectedPlans={setSelectedPlans}
                        />
                        <ProductPlanSelection
                            type={ProductType.Automation}
                            interval={interval}
                            product={automationProduct}
                            prices={automationPrices}
                            selectedPlans={selectedPlans}
                            setSelectedPlans={setSelectedPlans}
                            isStarterHelpdeskPlanSelected={
                                isStarterHelpdeskPlanSelected
                            }
                            isTrialing={isTrialing}
                            initialIndex={automationInitialIndex}
                        />
                        <ProductPlanSelection
                            type={ProductType.Voice}
                            interval={interval}
                            product={voiceProduct}
                            prices={voicePrices}
                            selectedPlans={selectedPlans}
                            setSelectedPlans={setSelectedPlans}
                            isStarterHelpdeskPlanSelected={
                                isStarterHelpdeskPlanSelected
                            }
                            isTrialing={isTrialing}
                        />
                        <ProductPlanSelection
                            type={ProductType.SMS}
                            interval={interval}
                            product={smsProduct}
                            prices={smsPrices}
                            selectedPlans={selectedPlans}
                            setSelectedPlans={setSelectedPlans}
                            isStarterHelpdeskPlanSelected={
                                isStarterHelpdeskPlanSelected
                            }
                            isTrialing={isTrialing}
                        />
                    </div>
                </Card>
                {isEnterpriseHelpdeskPlanSelected ? (
                    <Card title="Enterprise Plan">
                        <div className={css.enterprisePlanText}>
                            To subscribe to our Enterprise plan, please get in
                            touch with our team.
                        </div>
                        <div className={css.enterprisePlanFooter}>
                            <Button
                                intent="primary"
                                onClick={() => {
                                    setDefaultMessage(messageForEnterprise)
                                    setIsModalOpen(true)
                                }}
                            >
                                Contact Us
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <Card title={'Summary'}>
                        <div className={css.summary}>
                            <div className={css.summaryHeader}>
                                <div>PRODUCT</div>
                                <div>PRICE</div>
                            </div>
                            <SummaryItem
                                type={ProductType.Helpdesk}
                                interval={interval}
                                product={helpdeskProduct}
                                prices={helpdeskPrices}
                                selectedPlans={selectedPlans}
                            />
                            <SummaryItem
                                type={ProductType.Automation}
                                interval={interval}
                                product={automationProduct}
                                prices={automationPrices}
                                selectedPlans={selectedPlans}
                            />
                            <SummaryItem
                                type={ProductType.Voice}
                                interval={interval}
                                product={voiceProduct}
                                prices={voicePrices}
                                selectedPlans={selectedPlans}
                            />
                            <SummaryItem
                                type={ProductType.SMS}
                                interval={interval}
                                product={smsProduct}
                                prices={smsPrices}
                                selectedPlans={selectedPlans}
                            />
                            <SummaryTotal
                                selectedPlans={selectedPlans}
                                totalProductAmount={totalProductAmount}
                                interval={interval}
                                currency={helpdeskPrices?.[0].currency}
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
                            anyNewProductSelected={anyNewProductSelected}
                            anyDowngradedPlanSelected={
                                !!anyDowngradedPlanSelected
                            }
                            updateSubscription={updateSubscription}
                            periodEnd={periodEnd}
                            ctaText="Update Subscription"
                        />
                    </Card>
                )}
            </div>
        </div>
    )
}

export default BillingProcessView
