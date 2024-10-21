import React from 'react'
import {isTrialing as getIsTrialing} from 'state/currentAccount/selectors'

import useSessionStorage from 'hooks/useSessionStorage'
import {TicketPurpose} from 'state/billing/types'
import {ProductType} from 'models/billing/types'
import useAppSelector from 'hooks/useAppSelector'
import SummaryFooter from 'pages/settings/new_billing/components/SummaryFooter'
import SummaryItem from 'pages/settings/new_billing/components/SummaryItem'
import SummaryTotal from 'pages/settings/new_billing/components/SummaryTotal'
import {SELECTED_PRODUCTS_SESSION_STORAGE_KEY} from 'pages/settings/new_billing/constants'
import {useBillingPlans} from 'pages/settings/new_billing/hooks/useBillingPlan'
import {SelectedPlans} from 'pages/settings/new_billing/views/BillingProcessView/BillingProcessView'
import Card from 'pages/settings/new_billing/components/Card'
import css from './SubscriptionSummary.less'

export type ISubscriptionSummaryProps = {
    contactBilling: (ticketPurpose: TicketPurpose) => void
    dispatchBillingError: () => void
    isPaymentMethodValid: boolean
    isSubmitting: boolean
    handleSubmit: () => Promise<any>
}

export const SubscriptionSummary: React.FC<ISubscriptionSummaryProps> = ({
    contactBilling,
    dispatchBillingError,
    isPaymentMethodValid,
    isSubmitting,
    handleSubmit,
}) => {
    const [selectedPlansFromSessionStorage] = useSessionStorage<SelectedPlans>(
        SELECTED_PRODUCTS_SESSION_STORAGE_KEY
    )

    const isTrialing = useAppSelector(getIsTrialing)

    const {
        currentHelpdeskPlan,
        helpdeskAvailablePlans,
        currentAutomatePlan,
        automateAvailablePlans,
        currentSmsPlan,
        smsAvailablePlans,
        currentConvertPlan,
        convertAvailablePlans,
        currentVoicePlan,
        voiceAvailablePlans,
        anyDowngradedPlanSelected,
        totalProductAmount,
        interval,
        isSubscriptionCanceled,
        selectedPlans: selectedPlansFromState,
    } = useBillingPlans({
        contactBilling,
        dispatchBillingError,
        filterByInterval: true,
    })

    if (
        !isTrialing &&
        (!isSubscriptionCanceled || !selectedPlansFromSessionStorage)
    ) {
        // If user is not trialing and either the subscription is active or no plans are selected.
        return null
    }

    const selectedPlans = isSubscriptionCanceled
        ? selectedPlansFromSessionStorage
        : selectedPlansFromState

    return (
        <Card title="Summary">
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
            <h2 className={css.startSubscriptionTitle}>
                Start your subscription today
            </h2>
            <SummaryFooter
                isPaymentEnabled={true}
                isTrialing={isTrialing}
                isCurrentSubscriptionCanceled={isSubscriptionCanceled}
                isPaymentMethodFooter={true}
                isPaymentMethodValid={isPaymentMethodValid}
                anyProductChanged={true}
                anyNewProductSelected={true}
                anyDowngradedPlanSelected={!!anyDowngradedPlanSelected}
                periodEnd={''}
                updateSubscription={handleSubmit}
                isSubscriptionUpdating={isSubmitting}
                ctaText={`Subscribe now`}
            />
        </Card>
    )
}
