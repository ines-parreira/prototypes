import type React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import useAppSelector from 'hooks/useAppSelector'
import type {
    AutomatePlan,
    Cadence,
    ConvertPlan,
    HelpdeskPlan,
    SMSOrVoicePlan,
} from 'models/billing/types'
import { ProductType } from 'models/billing/types'
import { NewSummaryPaymentSection } from 'pages/settings/new_billing/components/SummaryPaymentSection/NewSummaryPaymentSection'
import { shouldPayWithShopify as getShouldPayWithShopify } from 'state/currentAccount/selectors'

import Card from '../../components/Card'
import SummaryFooter from '../../components/SummaryFooter'
import { SummaryItem } from '../../components/SummaryItem'
import SummaryTotal from '../../components/SummaryTotal'
import type { SelectedPlans } from '../../types'

import css from './BillingProcessView.less'

type CancellationDates = Partial<Record<ProductType, string | null>>

type BillingSummaryCardProps = {
    selectedPlans: SelectedPlans
    cadence: Cadence
    currentHelpdeskPlan?: HelpdeskPlan
    helpdeskAvailablePlans: HelpdeskPlan[]
    currentAutomatePlan?: AutomatePlan
    automateAvailablePlans: AutomatePlan[]
    currentVoicePlan?: SMSOrVoicePlan
    voiceAvailablePlans: SMSOrVoicePlan[]
    currentSmsPlan?: SMSOrVoicePlan
    smsAvailablePlans: SMSOrVoicePlan[]
    currentConvertPlan?: ConvertPlan
    convertAvailablePlans: ConvertPlan[]
    totalProductAmount: number
    anyProductChanged: boolean
    anyNewProductSelected: boolean
    anyDowngradedPlanSelected: boolean
    updateSubscription: () => Promise<void | [void, void, void]>
    startSubscription: () => Promise<void | [void, void]>
    isSubscriptionUpdating: boolean
    autoUpgradeChanged: boolean
    cancellationDates: CancellationDates
    totalCancelledAmount: number
    cancelledProducts: ProductType[]
    isTrialing: boolean
    isCurrentSubscriptionCanceled: boolean
    periodEnd: string
    ctaText: string
    hasCreditCard?: boolean
    isPaymentEnabled: boolean
    setUpdateProcessStarted: (isStarted: boolean) => void
    setSessionSelectedPlans?: React.Dispatch<SelectedPlans>
}

export function BillingSummaryCard({
    selectedPlans,
    cadence,
    currentHelpdeskPlan,
    helpdeskAvailablePlans,
    currentAutomatePlan,
    automateAvailablePlans,
    currentVoicePlan,
    voiceAvailablePlans,
    currentSmsPlan,
    smsAvailablePlans,
    currentConvertPlan,
    convertAvailablePlans,
    totalProductAmount,
    anyProductChanged,
    anyNewProductSelected,
    anyDowngradedPlanSelected,
    updateSubscription,
    startSubscription,
    isSubscriptionUpdating,
    autoUpgradeChanged,
    cancellationDates,
    totalCancelledAmount,
    cancelledProducts,
    isTrialing,
    isCurrentSubscriptionCanceled,
    periodEnd,
    ctaText,
    hasCreditCard,
    isPaymentEnabled,
    setUpdateProcessStarted,
    setSessionSelectedPlans,
}: BillingSummaryCardProps) {
    const shouldPayWithShopify = useAppSelector(getShouldPayWithShopify)

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
                    scheduledToCancelAt={
                        cancellationDates[ProductType.Automation]
                    }
                />
                <SummaryItem
                    productType={ProductType.Voice}
                    cadence={cadence}
                    currentPlan={currentVoicePlan}
                    availablePlans={voiceAvailablePlans}
                    selectedPlans={selectedPlans}
                    scheduledToCancelAt={cancellationDates[ProductType.Voice]}
                />
                <SummaryItem
                    productType={ProductType.SMS}
                    cadence={cadence}
                    currentPlan={currentSmsPlan}
                    availablePlans={smsAvailablePlans}
                    selectedPlans={selectedPlans}
                    scheduledToCancelAt={cancellationDates[ProductType.SMS]}
                />
                <SummaryItem
                    productType={ProductType.Convert}
                    cadence={cadence}
                    currentPlan={currentConvertPlan}
                    availablePlans={convertAvailablePlans}
                    selectedPlans={selectedPlans}
                    scheduledToCancelAt={cancellationDates[ProductType.Convert]}
                />
                <SummaryTotal
                    selectedPlans={selectedPlans}
                    totalProductAmount={totalProductAmount}
                    totalCancelledAmount={totalCancelledAmount}
                    cancelledProducts={cancelledProducts}
                    cadence={cadence}
                    currency={helpdeskAvailablePlans?.[0]?.currency}
                />
            </div>
            {!isTrialing && !isCurrentSubscriptionCanceled && (
                <NewSummaryPaymentSection trackingSource="subscription_update" />
            )}
            <SummaryFooter
                isPaymentEnabled={isPaymentEnabled}
                isTrialing={isTrialing}
                isCurrentSubscriptionCanceled={isCurrentSubscriptionCanceled}
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
                hasCreditCard={hasCreditCard}
                shouldPayWithShopify={shouldPayWithShopify}
                isSubscriptionUpdating={isSubscriptionUpdating}
                setUpdateProcessStarted={setUpdateProcessStarted}
                autoUpgradeChanged={autoUpgradeChanged}
                setSessionSelectedPlans={setSessionSelectedPlans}
            />
        </Card>
    )
}
