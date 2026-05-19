import { useState } from 'react'

import { BILLING_INTERNAL_PATH } from '@repo/billing'
import { useHistory } from 'react-router-dom'

import { Box, Button, Color, Tag, Text } from '@gorgias/axiom'
import { InvoiceCadence } from '@gorgias/helpdesk-types'

import {
    useBillingState,
    useInternalProductCatalogPlans,
} from 'models/billing/queries'
import { Cadence, SubscriptionStatus } from 'models/billing/types'
import type { SubscriptionSummary } from 'models/billing/types'
import Loader from 'pages/common/components/Loader/Loader'
import { InternalConfirmModal } from 'pages/settings/new_billing/components/BillingInternalViewUI/InternalManagePlanView/InternalConfirmModal'
import { InternalSelectPlans } from 'pages/settings/new_billing/components/BillingInternalViewUI/InternalManagePlanView/InternalSelectPlans/InternalSelectPlans'
import { InternalSummary } from 'pages/settings/new_billing/components/BillingInternalViewUI/InternalManagePlanView/InternalSummary'
import { useApplyInternalPlanChanges } from 'pages/settings/new_billing/components/BillingInternalViewUI/InternalManagePlanView/useApplyInternalPlanChanges'
import { useInternalPlanEditor } from 'pages/settings/new_billing/components/BillingInternalViewUI/InternalManagePlanView/useInternalPlanEditor'
import BillingScheduledUpdates from 'pages/settings/new_billing/components/BillingScheduledUpdates/BillingScheduledUpdates'

function getSubscriptionStatusTag(subscription: SubscriptionSummary) {
    if (subscription.is_paused) return { label: 'PAUSED', color: Color.Orange }
    if (subscription.is_trialing)
        return { label: 'TRIALING', color: Color.Blue }
    if (subscription.scheduled_to_cancel_at !== null)
        return { label: 'NON RENEWING', color: Color.Orange }
    switch (subscription.status) {
        case SubscriptionStatus.ACTIVE:
            return { label: 'ACTIVE', color: Color.Green }
        case SubscriptionStatus.CANCELED:
            return { label: 'CANCELED', color: Color.Red }
        case SubscriptionStatus.PAST_DUE:
            return { label: 'PAST DUE', color: Color.Red }
        case SubscriptionStatus.TRIALING:
            return { label: 'TRIALING', color: Color.Blue }
        default:
            return {
                label: subscription.status.toUpperCase(),
                color: Color.Orange,
            }
    }
}

export function InternalManagePlanView() {
    const history = useHistory()
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const {
        data: billingState,
        isLoading: isBillingLoading,
        isError: isBillingError,
    } = useBillingState()
    const {
        data: catalogData,
        isLoading: isCatalogLoading,
        isError: isCatalogError,
    } = useInternalProductCatalogPlans()
    const {
        targetPlans,
        resolvedPlans,
        hasChanges,
        priceSummary,
        contractCadence,
        invoiceCadence,
        filteredCatalogPlans,
        handlePlanSelect,
        handleContractCadenceChange,
        handleInvoiceCadenceChange,
    } = useInternalPlanEditor(
        billingState?.current_plans,
        catalogData?.plans,
        billingState?.subscription.discounts,
        billingState?.subscription.cadence ?? Cadence.Month,
        billingState?.subscription.invoice_cadence ?? InvoiceCadence.Month,
    )

    const { apply, isSubmitting } = useApplyInternalPlanChanges(
        billingState,
        resolvedPlans,
    )

    if (isBillingLoading || isCatalogLoading) return <Loader />

    if (isBillingError || isCatalogError)
        return <Text>An error has occurred: could not fetch billing data</Text>

    if (!billingState || !catalogData)
        return <Text>No billing data available</Text>

    const statusTag = getSubscriptionStatusTag(billingState.subscription)

    return (
        <Box flexDirection="column">
            <Box marginBottom="lg" alignItems="center" gap="md">
                <Button
                    leadingSlot="arrow_back"
                    variant="tertiary"
                    onClick={() => history.push(BILLING_INTERNAL_PATH)}
                >
                    Go Back
                </Button>
                <Box alignItems="center" gap="xs">
                    <Text color="content-neutral-secondary">
                        Subscription status
                    </Text>
                    <Tag color={statusTag.color}>{statusTag.label}</Tag>
                </Box>
            </Box>

            {[SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE].includes(
                billingState.subscription.status,
            ) && <BillingScheduledUpdates />}

            <Box gap="lg">
                <InternalSelectPlans
                    currentPlans={billingState.current_plans}
                    catalogPlans={filteredCatalogPlans}
                    targetPlans={targetPlans}
                    resolvedPlans={resolvedPlans}
                    contractCadence={contractCadence}
                    invoiceCadence={invoiceCadence}
                    onPlanSelect={handlePlanSelect}
                    onContractCadenceChange={handleContractCadenceChange}
                    onInvoiceCadenceChange={handleInvoiceCadenceChange}
                />
                <InternalSummary
                    billingState={billingState}
                    resolvedPlans={resolvedPlans}
                    priceSummary={priceSummary}
                    hasChanges={hasChanges}
                    invoiceCadence={invoiceCadence}
                    onPreviewChanges={() => setIsConfirmOpen(true)}
                />
            </Box>

            <InternalConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                resolvedPlans={resolvedPlans}
                priceSummary={priceSummary}
                billingState={billingState}
                contractCadence={contractCadence}
                invoiceCadence={invoiceCadence}
                onApply={apply}
                isSubmitting={isSubmitting}
            />
        </Box>
    )
}
