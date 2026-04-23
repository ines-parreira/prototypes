import { useMemo } from 'react'

import type {
    CancellationDates,
    PlansByProduct,
    SelectedPlans,
} from '@repo/billing'
import { DateAndTimeFormatting, formatDatetime } from '@repo/utils'

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
} from '@gorgias/axiom'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { ProductType } from 'models/billing/types'
import type { Cadence } from 'models/billing/types'

import { isPendingInvoiceError } from '../../utils/isPendingInvoiceError'
import { isVersionConflictError } from '../../utils/isVersionConflictError'
import { BillingSummaryBreakdown } from '../BillingSummaryBreakdown'
import { useConfirmChangesEstimate } from './useConfirmChangesEstimate'

export type ConfirmChangesModalProps = {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    isConfirming: boolean
    selectedPlans: SelectedPlans
    cadence: Cadence
    periodEnd: string
    plansByProduct: PlansByProduct
    totalProductAmount: number
    totalCancelledAmount: number
    cancelledProducts: ProductType[]
    currency: string
    cancellationDates?: CancellationDates
    subscriptionResourceVersion: number
    subscriptionRenewalRampResourceVersion?: number
    pendingInvoiceError?: boolean
    versionConflictError?: boolean
    isPaymentMethodMissing?: boolean
}

export function ConfirmChangesModal({
    isOpen,
    onClose,
    onConfirm,
    isConfirming,
    selectedPlans,
    cadence,
    periodEnd,
    plansByProduct,
    totalProductAmount,
    totalCancelledAmount,
    cancelledProducts,
    currency,
    cancellationDates,
    subscriptionResourceVersion,
    subscriptionRenewalRampResourceVersion,
    pendingInvoiceError = false,
    versionConflictError = false,
    isPaymentMethodMissing = false,
}: ConfirmChangesModalProps) {
    const {
        data: estimateResponse,
        isLoading: isEstimateLoading,
        isError: isEstimateError,
        error: estimateError,
        refetch: refetchEstimate,
    } = useConfirmChangesEstimate(
        isOpen,
        selectedPlans,
        plansByProduct,
        subscriptionResourceVersion,
        subscriptionRenewalRampResourceVersion,
    )

    const hasPendingInvoiceFromEstimate =
        isEstimateError && isPendingInvoiceError(estimateError)
    const showPendingInvoiceBanner =
        pendingInvoiceError || hasPendingInvoiceFromEstimate
    const hasVersionConflictFromEstimate =
        isEstimateError && isVersionConflictError(estimateError)
    const showVersionConflictBanner =
        versionConflictError || hasVersionConflictFromEstimate
    const showGenericEstimateError =
        isEstimateError &&
        !hasPendingInvoiceFromEstimate &&
        !showVersionConflictBanner

    const estimate = estimateResponse?.data
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.LongDateWithYear,
    )

    const description = useMemo(() => {
        let hasUpgrades = false
        let hasDowngrades = false
        let effectiveDate = periodEnd

        const hasEstimateSummaries =
            !!estimate?.immediate_changes_summary ||
            !!estimate?.scheduled_changes_summary

        if (hasEstimateSummaries) {
            hasUpgrades = !!estimate.immediate_changes_summary
            hasDowngrades = !!estimate.scheduled_changes_summary
            const scheduledDate =
                estimate.scheduled_changes_summary?.changes_will_apply_at
            if (scheduledDate) {
                effectiveDate = formatDatetime(
                    scheduledDate,
                    datetimeFormat,
                ).toString()
            }
        } else {
            for (const productType of Object.values(ProductType)) {
                const selected = selectedPlans[productType]
                if (!selected.isSelected || !selected.plan) continue
                const currentPlan = plansByProduct[productType].current
                if (!currentPlan) {
                    hasUpgrades = true
                } else if (selected.plan.amount > currentPlan.amount) {
                    hasUpgrades = true
                } else if (selected.plan.amount < currentPlan.amount) {
                    hasDowngrades = true
                }
            }
            if (cancelledProducts.length > 0) {
                hasDowngrades = true
            }
        }

        if (hasUpgrades && !hasDowngrades) {
            return 'Once you confirm, your changes will take effect immediately.'
        }
        if (hasDowngrades && !hasUpgrades) {
            return `Once you confirm, your changes will take effect at the end of your billing cycle on ${effectiveDate}.`
        }
        return `Once you confirm, your upgraded and added products will take effect immediately and your downgraded products will take effect at the end of your billing cycle on ${effectiveDate}.`
    }, [
        estimate,
        selectedPlans,
        plansByProduct,
        cancelledProducts,
        periodEnd,
        datetimeFormat,
    ])

    function handleOpenChange(open: boolean) {
        if (!open && !isConfirming) {
            onClose()
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={handleOpenChange}
            size={ModalSize.Md}
            aria-label="Confirm changes"
        >
            <OverlayHeader title="Confirm changes" />
            <OverlayContent>
                <Box flexDirection="column" width="100%" gap="md">
                    {showPendingInvoiceBanner && (
                        <Banner
                            title="Pending invoice must be resolved"
                            variant="inline"
                            description="Proration cannot be performed until all pending invoices are resolved."
                            isClosable={false}
                            intent="destructive"
                            icon="triangle-warning"
                        />
                    )}
                    {showVersionConflictBanner && !showPendingInvoiceBanner && (
                        <Banner
                            title="Refresh to continue"
                            variant="inline"
                            description={
                                <Text wrap="wrap">
                                    This subscription was modified since you
                                    loaded this page. Refresh to load the latest
                                    changes.
                                </Text>
                            }
                            isClosable={false}
                            intent="warning"
                            icon="triangle-warning"
                        />
                    )}
                    {isPaymentMethodMissing &&
                        !showPendingInvoiceBanner &&
                        !showVersionConflictBanner && (
                            <Banner
                                title="Add a payment method to continue"
                                variant="inline"
                                description={
                                    <Text wrap="wrap">
                                        You need an active payment method before
                                        confirming these changes.
                                    </Text>
                                }
                                isClosable={false}
                                intent="warning"
                                icon="triangle-warning"
                            />
                        )}
                    <Text>{description}</Text>
                    <Box flexDirection="column">
                        <BillingSummaryBreakdown
                            selectedPlans={selectedPlans}
                            cadence={cadence}
                            plansByProduct={plansByProduct}
                            totalProductAmount={totalProductAmount}
                            totalCancelledAmount={totalCancelledAmount}
                            cancelledProducts={cancelledProducts}
                            currency={currency}
                            cancellationDates={cancellationDates}
                            balanceDue={estimate?.balance_due}
                            isEstimateLoading={isEstimateLoading}
                            estimateErrorMessage={
                                showGenericEstimateError
                                    ? 'Failed to load estimate.'
                                    : undefined
                            }
                            onRetryEstimate={
                                showGenericEstimateError
                                    ? () => void refetchEstimate()
                                    : undefined
                            }
                        />
                    </Box>
                    <Separator direction="horizontal" variant="solid" />
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="sm">
                    <Button
                        variant="tertiary"
                        onClick={onClose}
                        isDisabled={isConfirming}
                    >
                        Go back
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        isLoading={isConfirming}
                        isDisabled={
                            showPendingInvoiceBanner ||
                            showVersionConflictBanner ||
                            isPaymentMethodMissing
                        }
                    >
                        Confirm
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
