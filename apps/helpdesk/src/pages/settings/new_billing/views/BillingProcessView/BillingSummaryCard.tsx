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

import { toast } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'
import type { Cadence } from 'models/billing/types'
import { NewSummaryPaymentSection } from 'pages/settings/new_billing/components/SummaryPaymentSection/NewSummaryPaymentSection'
import {
    getShopifyBillingStatus,
    shouldPayWithShopify as getShouldPayWithShopify,
} from 'state/currentAccount/selectors'
import { ShopifyBillingStatus } from 'state/currentAccount/types'

import { BillingSummaryBreakdown } from '../../components/BillingSummaryBreakdown'
import Card from '../../components/Card'
import { ConfirmChangesModal } from '../../components/ConfirmChangesModal'
import SummaryFooter from '../../components/SummaryFooter'
import { isPendingInvoiceError } from '../../utils/isPendingInvoiceError'
import { isVersionConflictError } from '../../utils/isVersionConflictError'

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
    hasAchPaymentMethod?: boolean
    isPaymentEnabled: boolean
    setUpdateProcessStarted: (isStarted: boolean) => void
    setSessionSelectedPlans?: React.Dispatch<SelectedPlans>
    subscriptionResourceVersion: number
    subscriptionRenewalRampResourceVersion?: number
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
    hasAchPaymentMethod,
    isPaymentEnabled,
    setUpdateProcessStarted,
    setSessionSelectedPlans,
    subscriptionResourceVersion,
    subscriptionRenewalRampResourceVersion,
}: BillingSummaryCardProps) {
    const shouldPayWithShopify = useAppSelector(getShouldPayWithShopify)
    const shopifyBillingStatus = useAppSelector(getShopifyBillingStatus)
    const history = useHistory()
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
    const [hasPendingInvoiceError, setHasPendingInvoiceError] = useState(false)
    const [hasVersionConflictError, setHasVersionConflictError] =
        useState(false)
    const isMidCycleUpgradeEnabled = useFlag(
        FeatureFlagKey.MidCycleUpgradeBillingLogic,
    )

    const currency =
        plansByProduct[ProductType.Helpdesk].available[0]?.currency ?? 'usd'
    const hasStripePaymentMethod =
        (hasCreditCard ?? true) || !!hasAchPaymentMethod

    const isActiveSubscription = !isTrialing && !isCurrentSubscriptionCanceled
    const isPaymentMethodMissing =
        isActiveSubscription &&
        (shouldPayWithShopify
            ? shopifyBillingStatus !== ShopifyBillingStatus.Active
            : !hasStripePaymentMethod)

    const handleCloseConfirmModal = () => {
        setIsConfirmModalOpen(false)
        setHasPendingInvoiceError(false)
        setHasVersionConflictError(false)
    }

    const handleUpdateSubscription = async () => {
        try {
            setUpdateProcessStarted(true)
            setHasPendingInvoiceError(false)
            setHasVersionConflictError(false)
            await updateSubscription()

            if (
                isCurrentSubscriptionCanceled &&
                (hasStripePaymentMethod ||
                    (shouldPayWithShopify &&
                        shopifyBillingStatus === ShopifyBillingStatus.Active))
            ) {
                await startSubscription()
            }

            toast.success('Your subscription has successfully been updated.', {
                duration: 5000,
            })

            setSessionSelectedPlans?.(selectedPlans)

            if (
                isTrialing ||
                (isCurrentSubscriptionCanceled &&
                    !shouldPayWithShopify &&
                    !hasStripePaymentMethod)
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
            if (isPendingInvoiceError(error)) {
                setHasPendingInvoiceError(true)
            } else if (isVersionConflictError(error)) {
                setHasVersionConflictError(true)
            } else {
                toast.error(
                    "Sorry, we couldn't update your subscription. Please try again.",
                    {
                        duration: 5000,
                    },
                )
                reportError(error as Error)
            }
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
                    isMidCycleUpgradeEnabled && !isTrialing
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
                hasAchPaymentMethod={hasAchPaymentMethod}
                shouldPayWithShopify={shouldPayWithShopify}
                shopifyBillingStatus={shopifyBillingStatus}
                isSubscriptionUpdating={isSubscriptionUpdating}
                setUpdateProcessStarted={setUpdateProcessStarted}
                autoUpgradeChanged={autoUpgradeChanged}
            />
            {isMidCycleUpgradeEnabled && (
                <ConfirmChangesModal
                    isOpen={isConfirmModalOpen}
                    onClose={handleCloseConfirmModal}
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
                    subscriptionResourceVersion={subscriptionResourceVersion}
                    subscriptionRenewalRampResourceVersion={
                        subscriptionRenewalRampResourceVersion
                    }
                    pendingInvoiceError={hasPendingInvoiceError}
                    versionConflictError={hasVersionConflictError}
                    isPaymentMethodMissing={isPaymentMethodMissing}
                    reactivate={isCurrentSubscriptionCanceled}
                />
            )}
        </Card>
    )
}
