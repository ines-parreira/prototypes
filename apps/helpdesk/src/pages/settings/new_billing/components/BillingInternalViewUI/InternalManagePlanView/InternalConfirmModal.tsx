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
    Separator,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { InvoiceCadence } from '@gorgias/helpdesk-types'

import { isGorgiasApiError } from 'models/api/types'
import type { BillingState, Cadence } from 'models/billing/types'
import { NewSummaryPaymentSection } from 'pages/settings/new_billing/components/SummaryPaymentSection/NewSummaryPaymentSection'

import { ConfirmSummaryTable } from './ConfirmSummaryTable'
import { ReactivationInvoiceList } from './ReactivationInvoiceList'
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
    const [showRawBreakdown, setShowRawBreakdown] = useState(false)
    const [showRawImmediateChanges, setShowRawImmediateChanges] =
        useState(false)

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
        isOpen,
        resolvedPlans,
        billingState.subscription.resource_version,
        billingState.subscription.schedule_resource_version,
        isCurrentSubscriptionCanceled,
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

    const currency = billingState.current_plans.helpdesk.currency ?? 'usd'
    const currentInvoicesToPay = estimate?.current_invoices_to_pay

    const termChangeDisclaimer =
        (isCadenceChange ||
            (isCurrentSubscriptionCanceled &&
                (estimate?.balance_due ?? 0) > 0)) &&
        estimate?.immediate_changes_summary
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
                    showBalanceDue={true}
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
            {isCurrentSubscriptionCanceled &&
                currentInvoicesToPay != null &&
                currentInvoicesToPay.length > 0 && (
                    <OverlayContent>
                        <Separator direction="horizontal" variant="solid" />
                        <ReactivationInvoiceList
                            invoices={currentInvoicesToPay}
                            currency={currency}
                        />
                    </OverlayContent>
                )}
            <OverlayContent>
                <NewSummaryPaymentSection trackingSource="internal_subscription_update" />
            </OverlayContent>
            {(estimate?.estimated_prorated_credits_charges != null ||
                estimate?.immediate_changes_summary != null) && (
                <OverlayContent>
                    <Box flexDirection="column" gap="sm">
                        {estimate?.estimated_prorated_credits_charges !=
                            null && (
                            <Box flexDirection="column" gap="sm">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() =>
                                        setShowRawBreakdown((v) => !v)
                                    }
                                >
                                    {showRawBreakdown
                                        ? 'Hide balance breakdown'
                                        : 'View balance breakdown'}
                                </Button>
                                {showRawBreakdown && (
                                    <pre
                                        style={{
                                            fontSize: 12,
                                            overflowX: 'auto',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-all',
                                        }}
                                    >
                                        {JSON.stringify(
                                            estimate.estimated_prorated_credits_charges,
                                            null,
                                            2,
                                        )}
                                    </pre>
                                )}
                            </Box>
                        )}
                        {estimate?.immediate_changes_summary != null && (
                            <Box flexDirection="column" gap="sm">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() =>
                                        setShowRawImmediateChanges((v) => !v)
                                    }
                                >
                                    {showRawImmediateChanges
                                        ? 'Hide immediate changes summary'
                                        : 'View immediate changes summary'}
                                </Button>
                                {showRawImmediateChanges && (
                                    <pre
                                        style={{
                                            fontSize: 12,
                                            overflowX: 'auto',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-all',
                                        }}
                                    >
                                        {JSON.stringify(
                                            estimate.immediate_changes_summary,
                                            null,
                                            2,
                                        )}
                                    </pre>
                                )}
                            </Box>
                        )}
                    </Box>
                </OverlayContent>
            )}
            <OverlayFooter>
                <Box gap="sm">{renderFooterButtons()}</Box>
            </OverlayFooter>
        </Modal>
    )
}
