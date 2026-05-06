import { useState } from 'react'

import { BILLING_INTERNAL_PATH } from '@repo/billing'
import { useHistory } from 'react-router-dom'

import { Box, Button, Text } from '@gorgias/axiom'
import { InvoiceCadence } from '@gorgias/helpdesk-types'

import {
    useBillingState,
    useInternalProductCatalogPlans,
} from 'models/billing/queries'
import { Cadence } from 'models/billing/types'
import Loader from 'pages/common/components/Loader/Loader'
import { InternalConfirmModal } from 'pages/settings/new_billing/components/BillingInternalViewUI/InternalManagePlanView/InternalConfirmModal'
import { InternalSelectPlans } from 'pages/settings/new_billing/components/BillingInternalViewUI/InternalManagePlanView/InternalSelectPlans/InternalSelectPlans'
import { InternalSummary } from 'pages/settings/new_billing/components/BillingInternalViewUI/InternalManagePlanView/InternalSummary'
import { useApplyInternalPlanChanges } from 'pages/settings/new_billing/components/BillingInternalViewUI/InternalManagePlanView/useApplyInternalPlanChanges'
import { useInternalPlanEditor } from 'pages/settings/new_billing/components/BillingInternalViewUI/InternalManagePlanView/useInternalPlanEditor'

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

    return (
        <Box flexDirection="column">
            <Box marginBottom="lg">
                <Button
                    leadingSlot="arrow_back"
                    variant="tertiary"
                    onClick={() => history.push(BILLING_INTERNAL_PATH)}
                >
                    Go Back
                </Button>
            </Box>

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
                invoiceCadence={invoiceCadence}
                onApply={apply}
                isSubmitting={isSubmitting}
            />
        </Box>
    )
}
