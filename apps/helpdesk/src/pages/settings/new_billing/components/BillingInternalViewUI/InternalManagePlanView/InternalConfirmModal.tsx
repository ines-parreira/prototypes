import { useState } from 'react'

import { SubscriptionStatus } from '@repo/billing'

import {
    Box,
    Button,
    Modal,
    ModalSize,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { InvoiceCadence } from '@gorgias/helpdesk-types'

import { isGorgiasApiError } from 'models/api/types'
import type { BillingState } from 'models/billing/types'
import { NewSummaryPaymentSection } from 'pages/settings/new_billing/components/SummaryPaymentSection/NewSummaryPaymentSection'

import { ConfirmSummaryTable } from './ConfirmSummaryTable'
import { useInternalConfirmChangesEstimate } from './useInternalConfirmChangesEstimate'
import type { PriceSummary, ResolvedPlan } from './useInternalPlanEditor'

const INVOICE_ACTIONS = ['with', 'without', 'reactivate'] as const
type InvoiceAction = (typeof INVOICE_ACTIONS)[number]

type InternalConfirmModalProps = {
    isOpen: boolean
    onClose: () => void
    resolvedPlans: ResolvedPlan[]
    priceSummary: PriceSummary
    billingState: BillingState
    invoiceCadence: InvoiceCadence
    onApply: (generateInvoice: boolean, reactivate?: boolean) => void
    isSubmitting: boolean
}

export function InternalConfirmModal({
    isOpen,
    onClose,
    resolvedPlans,
    priceSummary,
    billingState,
    invoiceCadence,
    onApply,
    isSubmitting,
}: InternalConfirmModalProps) {
    const [activeAction, setActiveAction] = useState<InvoiceAction | null>(null)

    const isTrialing = billingState.subscription.is_trialing
    const isCurrentSubscriptionCanceled =
        billingState.subscription.status === SubscriptionStatus.CANCELED
    const isPaused = billingState.subscription.is_paused
    const {
        data: estimate,
        error: estimateError,
        isLoading: isEstimateLoading,
        isFetching: isEstimateFetching,
        isError: isEstimateError,
        refetch: refetchEstimate,
    } = useInternalConfirmChangesEstimate(
        isOpen && !isCurrentSubscriptionCanceled,
        resolvedPlans,
        billingState.subscription.resource_version,
        billingState.subscription.schedule_resource_version,
    )

    const hasUpgrade = resolvedPlans.some(
        ({ status }) => status === 'upgraded' || status === 'added',
    )

    const isBalanceDueNegative = (estimate?.balance_due ?? 0) < 0

    const isWriteBlocked =
        !window.USER_IMPERSONATED_AUTHORIZED_FOR_BILLING_WRITE_OPS
    const isApplyDisabled =
        isWriteBlocked ||
        isSubmitting ||
        isEstimateFetching ||
        isEstimateError ||
        isPaused
    const isApplyWithInvoiceDisabled = isApplyDisabled || isBalanceDueNegative

    const estimateErrorMessage = isEstimateError
        ? isGorgiasApiError(estimateError)
            ? estimateError.response.data.error.msg
            : 'Failed to load estimate.'
        : undefined

    function handleApply(action: InvoiceAction) {
        setActiveAction(action)
        if (action === 'reactivate') {
            onApply(true, true)
        } else {
            onApply(action === 'with')
        }
    }

    const writeBlockedTooltip = isWriteBlocked ? (
        <TooltipContent title="You are not authorized to perform this action. Please reach out to the Billing Ops team to do it" />
    ) : null

    const pausedTooltip =
        !isWriteBlocked && isPaused ? (
            <TooltipContent title="Your subscription is paused please resume/schedule resumption in Chargebee directly" />
        ) : null

    const negativeBalanceTooltip =
        !isWriteBlocked && !isPaused && isBalanceDueNegative ? (
            <TooltipContent title="A negative balance cannot be charged via invoice. Use 'Apply without invoice' instead." />
        ) : null

    function renderFooterButtons() {
        if (isTrialing) {
            return (
                <Tooltip
                    trigger={
                        <Button
                            onClick={() => handleApply('without')}
                            isLoading={isSubmitting}
                            isDisabled={isApplyDisabled}
                        >
                            Apply
                        </Button>
                    }
                >
                    {writeBlockedTooltip}
                </Tooltip>
            )
        }

        if (isCurrentSubscriptionCanceled) {
            return (
                <Tooltip
                    trigger={
                        <Button
                            onClick={() => handleApply('reactivate')}
                            isLoading={
                                isSubmitting && activeAction === 'reactivate'
                            }
                            isDisabled={isApplyDisabled}
                        >
                            Reactivate
                        </Button>
                    }
                >
                    {writeBlockedTooltip}
                </Tooltip>
            )
        }

        if (hasUpgrade) {
            return (
                <>
                    <Tooltip
                        trigger={
                            <Button
                                variant="secondary"
                                onClick={() => handleApply('without')}
                                isLoading={
                                    isSubmitting && activeAction === 'without'
                                }
                                isDisabled={isApplyDisabled}
                            >
                                Apply without invoice
                            </Button>
                        }
                    >
                        {writeBlockedTooltip}
                        {pausedTooltip}
                    </Tooltip>
                    <Tooltip
                        trigger={
                            <Button
                                onClick={() => handleApply('with')}
                                isLoading={
                                    isSubmitting && activeAction === 'with'
                                }
                                isDisabled={isApplyWithInvoiceDisabled}
                            >
                                Apply with invoice
                            </Button>
                        }
                    >
                        {writeBlockedTooltip}
                        {pausedTooltip}
                        {negativeBalanceTooltip}
                    </Tooltip>
                </>
            )
        }

        return (
            <Tooltip
                trigger={
                    <Button
                        onClick={() => handleApply('without')}
                        isLoading={isSubmitting}
                        isDisabled={isApplyDisabled}
                    >
                        Apply
                    </Button>
                }
            >
                {writeBlockedTooltip}
                {pausedTooltip}
            </Tooltip>
        )
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size={ModalSize.Md}>
            <OverlayHeader
                title="Confirm changes"
                description={
                    <Text>
                        Once you confirm, your changes will take effect
                        immediately.
                    </Text>
                }
            />
            <OverlayContent>
                <ConfirmSummaryTable
                    billingState={billingState}
                    resolvedPlans={resolvedPlans}
                    priceSummary={priceSummary}
                    invoiceCadence={invoiceCadence}
                    balanceDue={estimate?.balance_due}
                    isEstimateLoading={isEstimateLoading || isEstimateFetching}
                    estimateErrorMessage={estimateErrorMessage}
                    onRetryEstimate={() => void refetchEstimate()}
                    showBalanceDue={!isCurrentSubscriptionCanceled}
                />
            </OverlayContent>
            <OverlayContent>
                <NewSummaryPaymentSection trackingSource="internal_subscription_update" />
            </OverlayContent>
            <OverlayFooter>
                <Box gap="sm">{renderFooterButtons()}</Box>
            </OverlayFooter>
        </Modal>
    )
}
