import { useMemo } from 'react'

import type {
    CancellationDates,
    PlansByProduct,
    SelectedPlans,
} from '@repo/billing'
import { DateAndTimeFormatting, formatDatetime } from '@repo/utils'

import {
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
}: ConfirmChangesModalProps) {
    const {
        data: estimateResponse,
        isLoading: isEstimateLoading,
        isError: isEstimateError,
        refetch: refetchEstimate,
    } = useConfirmChangesEstimate(
        isOpen,
        selectedPlans,
        plansByProduct,
        subscriptionResourceVersion,
        subscriptionRenewalRampResourceVersion,
    )

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
                    <Text>{description}</Text>
                    {isEstimateError && (
                        <Box alignItems="center" gap="xs">
                            <Text color="content-error-default" size="sm">
                                Failed to load estimate.
                            </Text>
                            <Button
                                variant="tertiary"
                                size="sm"
                                onClick={() => void refetchEstimate()}
                            >
                                Retry
                            </Button>
                        </Box>
                    )}
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
                    >
                        Confirm
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
