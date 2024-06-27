import React, {useEffect, useMemo, useState} from 'react'
import {useParams} from 'react-router-dom'
import {dismissNotification} from 'reapop'

import _capitalize from 'lodash/capitalize'
import {
    AutomatePlan,
    ConvertPlan,
    HelpdeskPlan,
    ProductType,
    SMSOrVoicePlan,
} from 'models/billing/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {fetchCreditCard} from 'state/billing/actions'
import Button from 'pages/common/components/button/Button'
import {CurrentProductsUsages, TicketPurpose} from 'state/billing/types'
import Alert from 'pages/common/components/Alert/Alert'
import PendingChangesModal from 'pages/settings/helpCenter/components/PendingChangesModal/PendingChangesModal'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentSubscription} from 'state/currentAccount/selectors'
import {getCurrentPlansByProduct} from 'state/billing/selectors'
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
import {useCreditCard} from '../../hooks/useCreditCard'
import ScheduledCancellationSummary from '../../components/ScheduledCancellationSummary'
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
    isCurrentSubscriptionCanceled: boolean
    periodEnd: string
    currentUsage: CurrentProductsUsages
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
}: BillingProcessViewProps) => {
    const dispatch = useAppDispatch()
    const [isPaymentEnabled, setIsPaymentEnabled] = useState(false)
    const [isCreditCardFetched, setIsCreditCardFetched] = useState(false)
    const [showPendingChangesModal, setShowPendingChangesModal] =
        useState(false)
    const [updateProcessStarted, setUpdateProcessStarted] = useState(false)

    // Current subscription state
    const currentSubscriptionScheduledToCancelAt = useAppSelector(
        getCurrentSubscription
    ).get('scheduled_to_cancel_at')
    const isCurrentSubscriptionScheduledToCancel =
        !!currentSubscriptionScheduledToCancelAt
    const currentSubscriptionProducts = useAppSelector(getCurrentPlansByProduct)

    // Selected product to Subscribe or Update
    const {selectedProduct} = useParams<Params>()

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
        interval,
        updateSubscription,
        startSubscription,
        isSubscriptionUpdating,
        autoUpgradeChanged,
    } = useBillingPlans({
        contactBilling,
        dispatchBillingError,
        selectedProduct,
        filterByInterval: true,
    })

    const {hasCreditCard, shouldPayWithShopify} = useCreditCard({
        contactBilling,
        dispatchBillingError,
    })

    const ctaText = useMemo(() => {
        if (isCurrentSubscriptionCanceled && hasCreditCard) {
            return 'Subscribe now'
        }
        return 'Update Subscription'
    }, [isCurrentSubscriptionCanceled, hasCreditCard])

    const voiceOrSMSChanged =
        (selectedPlans[ProductType.Voice].isSelected &&
            currentVoicePlan?.price_id !==
                selectedPlans[ProductType.Voice].plan?.price_id) ||
        (selectedPlans[ProductType.SMS].isSelected &&
            currentSmsPlan?.price_id !==
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
            const productName = _capitalize(key)
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

    const renderSummary = () => {
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

        if (
            currentSubscriptionScheduledToCancelAt &&
            currentSubscriptionProducts
        ) {
            return (
                <Card title={'Summary'}>
                    <ScheduledCancellationSummary
                        cancelledProducts={Object.keys(
                            currentSubscriptionProducts
                        ).map(
                            (type) => PRODUCT_INFO[type as ProductType].title
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

        return (
            <Card title={'Summary'}>
                <div className={css.summary}>
                    <div className={css.summaryHeader}>
                        <div>PRODUCT</div>
                        <div>PRICE</div>
                    </div>
                    <SummaryItem
                        productType={ProductType.Helpdesk}
                        interval={interval}
                        currentPlan={currentHelpdeskPlan}
                        availablePlans={helpdeskAvailablePlans}
                        selectedPlans={selectedPlans}
                    />
                    <SummaryItem
                        productType={ProductType.Automation}
                        interval={interval}
                        currentPlan={currentAutomatePlan}
                        availablePlans={automateAvailablePlans}
                        selectedPlans={selectedPlans}
                    />
                    <SummaryItem
                        productType={ProductType.Voice}
                        interval={interval}
                        currentPlan={currentVoicePlan}
                        availablePlans={voiceAvailablePlans}
                        selectedPlans={selectedPlans}
                    />
                    <SummaryItem
                        productType={ProductType.SMS}
                        interval={interval}
                        currentPlan={currentSmsPlan}
                        availablePlans={smsAvailablePlans}
                        selectedPlans={selectedPlans}
                    />
                    <SummaryItem
                        productType={ProductType.Convert}
                        interval={interval}
                        currentPlan={currentConvertPlan}
                        availablePlans={convertAvailablePlans}
                        selectedPlans={selectedPlans}
                    />
                    <SummaryTotal
                        selectedPlans={selectedPlans}
                        totalProductAmount={totalProductAmount}
                        interval={interval}
                        currency={helpdeskAvailablePlans?.[0].currency}
                    />
                </div>
                {!isTrialing && !isCurrentSubscriptionCanceled && (
                    <SummaryPaymentSection
                        setIsPaymentEnabled={setIsPaymentEnabled}
                        isCreditCardFetched={isCreditCardFetched}
                    />
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
                    updateSubscription={updateSubscription}
                    startSubscription={startSubscription}
                    periodEnd={periodEnd}
                    selectedPlans={selectedPlans}
                    ctaText={ctaText}
                    hasCreditCard={hasCreditCard}
                    shouldPayWithShopify={shouldPayWithShopify}
                    isSubscriptionUpdating={isSubscriptionUpdating}
                    setUpdateProcessStarted={setUpdateProcessStarted}
                    autoUpgradeChanged={autoUpgradeChanged}
                />
            </Card>
        )
    }
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
                            product={currentHelpdeskPlan}
                            prices={helpdeskAvailablePlans}
                            selectedPlans={selectedPlans}
                            periodEnd={periodEnd}
                            isTrialing={isTrialing}
                            setSelectedPlans={setSelectedPlans}
                            editingAvailable={
                                !isCurrentSubscriptionScheduledToCancel
                            }
                        />
                        <div className={css.separator} />
                        <ProductPlanSelection
                            type={ProductType.Automation}
                            interval={interval}
                            product={currentAutomatePlan}
                            prices={automateAvailablePlans}
                            selectedPlans={selectedPlans}
                            setSelectedPlans={setSelectedPlans}
                            initialIndex={automationInitialIndex}
                            periodEnd={periodEnd}
                            currentUsage={currentUsage}
                            editingAvailable={
                                !isCurrentSubscriptionScheduledToCancel
                            }
                        />
                        <div className={css.separator} />
                        <ProductPlanSelection
                            type={ProductType.Voice}
                            interval={interval}
                            product={currentVoicePlan}
                            prices={voiceAvailablePlans}
                            selectedPlans={selectedPlans}
                            setSelectedPlans={setSelectedPlans}
                            isTrialing={isTrialing}
                            initialIndex={voiceInitialIndex}
                            editingAvailable={
                                !isCurrentSubscriptionScheduledToCancel
                            }
                        />
                        <div className={css.separator} />
                        <ProductPlanSelection
                            type={ProductType.SMS}
                            interval={interval}
                            product={currentSmsPlan}
                            prices={smsAvailablePlans}
                            selectedPlans={selectedPlans}
                            setSelectedPlans={setSelectedPlans}
                            isTrialing={isTrialing}
                            initialIndex={smsInitialIndex}
                            editingAvailable={
                                !isCurrentSubscriptionScheduledToCancel
                            }
                        />
                        <div className={css.separator} />
                        <ProductPlanSelection
                            type={ProductType.Convert}
                            interval={interval}
                            product={currentConvertPlan}
                            prices={convertAvailablePlans}
                            selectedPlans={selectedPlans}
                            setSelectedPlans={setSelectedPlans}
                            isTrialing={isTrialing}
                            initialIndex={convertInitialIndex}
                            editingAvailable={
                                !isCurrentSubscriptionScheduledToCancel
                            }
                        />
                    </div>
                </Card>
                {renderSummary()}
            </div>
            {!isCurrentSubscriptionScheduledToCancel && (
                <PendingChangesModal
                    onSave={updateSubscription}
                    onDiscard={() => setShowPendingChangesModal(false)}
                    onContinueEditing={() => setShowPendingChangesModal(false)}
                    when={anyProductChanged && !updateProcessStarted}
                    message="Your subscription changes will only be taken into account after you click “Update subscription”"
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
