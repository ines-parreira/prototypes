import { useState } from 'react'

import { SubscriptionStatus } from '@repo/billing'
import moment from 'moment'

import {
    Banner,
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
import type { BillingState, Cadence } from 'models/billing/types'
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
    contractCadence: Cadence
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
    contractCadence,
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
        billingState.subscription.schedule_resource_version ?? undefined,
    )

    const hasUpgrade = resolvedPlans.some(
        ({ status }) => status === 'upgraded' || status === 'added',
    )

    const isCadenceChange =
        contractCadence !== billingState.subscription.cadence

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

        if (isCadenceChange || hasUpgrade) {
            const withoutLabel = isCadenceChange
                ? 'Apply without prorated credits'
                : 'Apply without invoice'
            const withLabel = isCadenceChange
                ? 'Apply with prorated credits'
                : 'Apply with invoice'

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
                                {withoutLabel}
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
                                {withLabel}
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

    const termChangeDisclaimer =
        isCadenceChange && estimate?.immediate_changes_summary
            ? `A new term for the subscription will start: ${moment.unix(estimate.immediate_changes_summary.new_term_start).format('LL')} to ${moment.unix(estimate.immediate_changes_summary.new_term_end).format('LL')}.`
            : null

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
            {termChangeDisclaimer && (
                <OverlayContent>
                    <Banner
                        variant="inline"
                        intent="warning"
                        icon="warning-triangle"
                        isClosable={false}
                        description={termChangeDisclaimer}
                    />
                </OverlayContent>
            )}
            <OverlayContent>
                <NewSummaryPaymentSection trackingSource="internal_subscription_update" />
            </OverlayContent>
            <OverlayFooter>
                <Box gap="sm">{renderFooterButtons()}</Box>
            </OverlayFooter>
        </Modal>
    )
}
