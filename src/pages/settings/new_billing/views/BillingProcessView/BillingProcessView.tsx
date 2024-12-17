import {useFlags} from 'launchdarkly-react-client-sdk'
import _capitalize from 'lodash/capitalize'
import React, {useEffect, useMemo, useState} from 'react'
import {useParams} from 'react-router-dom'
import {dismissNotification} from 'reapop'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    AutomatePlan,
    ConvertPlan,
    HelpdeskPlan,
    ProductType,
    SMSOrVoicePlan,
} from 'models/billing/types'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import PendingChangesModal from 'pages/settings/helpCenter/components/PendingChangesModal/PendingChangesModal'
import {NewSummaryPaymentSection} from 'pages/settings/new_billing/components/SummaryPaymentSection/NewSummaryPaymentSection'
import {useIsPaymentEnabled} from 'pages/settings/new_billing/hooks/useIsPaymentEnabled'
import {useHasCreditCard} from 'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useHasCreditCard'
import {fetchCreditCard} from 'state/billing/actions'
import {getCurrentPlansByProduct} from 'state/billing/selectors'
import {CurrentProductsUsages, TicketPurpose} from 'state/billing/types'
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
import SummaryPaymentSection from '../../components/SummaryPaymentSection'
import SummaryTotal from '../../components/SummaryTotal'
import VoiceOrSmsChangeReviewAlert from '../../components/VoiceOrSmsChangeReviewAlert'
import {
    ENTERPRISE_PRICE_ID,
    PRICING_DETAILS_URL,
    PRODUCT_INFO,
} from '../../constants'

import {useBillingPlans} from '../../hooks/useBillingPlan'
import {formatNumTickets} from '../../utils/formatAmount'
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
    const hasCreditCard = useHasCreditCard()
    const [oldIsPaymentEnabled, setIsPaymentEnabled] = useState(false)
    const newIsPaymentEnabled = !!useIsPaymentEnabled()
    const isPaymentEnabled = oldIsPaymentEnabled || newIsPaymentEnabled
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

    const isNewSummaryPaymentSectionON =
        !!useFlags()[FeatureFlagKey.BillingNewSummaryPaymentSection]

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
        dispatchBillingError,
        selectedProduct,
        filterByInterval: true,
    })

    const shouldPayWithShopify = useAppSelector(getShouldPayWithShopify)

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

    if (hasCreditCard.isLoading) return <Loader />

    const ctaText =
        isCurrentSubscriptionCanceled && hasCreditCard.data
            ? 'Subscribe now'
            : 'Update Subscription'

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
                {!isTrialing &&
                !isCurrentSubscriptionCanceled &&
                isNewSummaryPaymentSectionON ? (
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
                    hasCreditCard={hasCreditCard.data}
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
            <VoiceOrSmsChangeReviewAlert
                selectedPlans={selectedPlans}
            ></VoiceOrSmsChangeReviewAlert>
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
                            currentPlan={currentHelpdeskPlan}
                            availablePlans={helpdeskAvailablePlans}
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
                        />
                        <div className={css.separator} />
                        <ProductPlanSelection
                            type={ProductType.Voice}
                            interval={interval}
                            currentPlan={currentVoicePlan}
                            availablePlans={voiceAvailablePlans}
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
                            currentPlan={currentSmsPlan}
                            availablePlans={smsAvailablePlans}
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
                            currentPlan={currentConvertPlan}
                            availablePlans={convertAvailablePlans}
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
