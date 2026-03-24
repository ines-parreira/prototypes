import type React from 'react'
import { useState } from 'react'

import type {
    CancellationDates,
    PlansByProduct,
    SelectedPlans,
} from '@repo/billing'
import {
    ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
    BILLING_BASE_PATH,
    BILLING_PAYMENT_CARD_PATH,
} from '@repo/billing'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { logEvent, reportError, SegmentEvent } from '@repo/logging'
import { useHistory } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'
import type { Cadence } from 'models/billing/types'
import { NewSummaryPaymentSection } from 'pages/settings/new_billing/components/SummaryPaymentSection/NewSummaryPaymentSection'
import {
    getShopifyBillingStatus,
    shouldPayWithShopify as getShouldPayWithShopify,
} from 'state/currentAccount/selectors'
import { ShopifyBillingStatus } from 'state/currentAccount/types'
import { notify } from 'state/notifications/actions'
import {
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'

import { BillingSummaryBreakdown } from '../../components/BillingSummaryBreakdown'
import Card from '../../components/Card'
import { ConfirmChangesModal } from '../../components/ConfirmChangesModal'
import SummaryFooter from '../../components/SummaryFooter'

import css from './BillingProcessView.less'

type BillingSummaryCardProps = {
    selectedPlans: SelectedPlans
    cadence: Cadence
    plansByProduct: PlansByProduct
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
    plansByProduct,
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
    const shopifyBillingStatus = useAppSelector(getShopifyBillingStatus)
    const dispatch = useAppDispatch()
    const history = useHistory()
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
    const isMidCycleUpgradeEnabled = useFlag(
        FeatureFlagKey.MidCycleUpgradeBillingLogic,
    )

    const currency =
        plansByProduct[ProductType.Helpdesk].available[0]?.currency ?? 'usd'
    const hasPaymentMethod = hasCreditCard ?? true

    const handleUpdateSubscription = async () => {
        try {
            setUpdateProcessStarted(true)
            await updateSubscription()

            if (
                isCurrentSubscriptionCanceled &&
                (hasPaymentMethod ||
                    (shouldPayWithShopify &&
                        shopifyBillingStatus === ShopifyBillingStatus.Active))
            ) {
                await startSubscription()
            }

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    style: NotificationStyle.Alert,
                    showDismissButton: true,
                    dismissAfter: 5000,
                    message: 'Your subscription has successfully been updated.',
                }),
            )

            setSessionSelectedPlans?.(selectedPlans)

            if (
                isTrialing ||
                (isCurrentSubscriptionCanceled && !hasPaymentMethod)
            ) {
                history.push(BILLING_PAYMENT_CARD_PATH)
            } else if (
                shouldPayWithShopify &&
                shopifyBillingStatus !== ShopifyBillingStatus.Active
            ) {
                history.push(ACTIVATE_PAYMENT_WITH_SHOPIFY_URL)
            } else {
                history.push(BILLING_BASE_PATH)
            }
        } catch (error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    style: NotificationStyle.Alert,
                    showDismissButton: true,
                    message:
                        "Sorry, we couldn't update your subscription. Please try again.",
                }),
            )
            reportError(error as Error)
            setUpdateProcessStarted(false)
            return false
        }
        return true
    }

    async function handleConfirmAndUpdate() {
        const success = await handleUpdateSubscription()
        if (success) {
            setIsConfirmModalOpen(false)
        }
    }

    return (
        <Card title={'Summary'}>
            <div className={css.summary}>
                <BillingSummaryBreakdown
                    selectedPlans={selectedPlans}
                    cadence={cadence}
                    plansByProduct={plansByProduct}
                    totalProductAmount={totalProductAmount}
                    totalCancelledAmount={totalCancelledAmount}
                    cancelledProducts={cancelledProducts}
                    currency={currency}
                    cancellationDates={cancellationDates}
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
                onOpenConfirmationModal={
                    isMidCycleUpgradeEnabled
                        ? () => {
                              logEvent(
                                  SegmentEvent.BillingUsageAndPlansUpdateSubscriptionClicked,
                              )
                              setIsConfirmModalOpen(true)
                          }
                        : undefined
                }
                updateSubscription={() => {
                    logEvent(
                        SegmentEvent.BillingUsageAndPlansUpdateSubscriptionClicked,
                    )
                    return updateSubscription()
                }}
                startSubscription={startSubscription}
                setSessionSelectedPlans={setSessionSelectedPlans}
                periodEnd={periodEnd}
                selectedPlans={selectedPlans}
                ctaText={ctaText}
                hasCreditCard={hasCreditCard}
                shouldPayWithShopify={shouldPayWithShopify}
                isSubscriptionUpdating={isSubscriptionUpdating}
                setUpdateProcessStarted={setUpdateProcessStarted}
                autoUpgradeChanged={autoUpgradeChanged}
            />
            {isMidCycleUpgradeEnabled && (
                <ConfirmChangesModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    onConfirm={handleConfirmAndUpdate}
                    isConfirming={isSubscriptionUpdating}
                    selectedPlans={selectedPlans}
                    cadence={cadence}
                    periodEnd={periodEnd}
                    plansByProduct={plansByProduct}
                    totalProductAmount={totalProductAmount}
                    totalCancelledAmount={totalCancelledAmount}
                    cancelledProducts={cancelledProducts}
                    currency={currency}
                    cancellationDates={cancellationDates}
                />
            )}
        </Card>
    )
}
