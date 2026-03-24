import { useMemo } from 'react'

import type {
    CancellationDates,
    PlansByProduct,
    SelectedPlans,
} from '@repo/billing'

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

import { ProductType } from 'models/billing/types'
import type { Cadence } from 'models/billing/types'

import { BillingSummaryBreakdown } from '../BillingSummaryBreakdown'

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
}: ConfirmChangesModalProps) {
    const description = useMemo(() => {
        let hasUpgrades = false
        let hasDowngrades = false

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

        if (hasUpgrades && !hasDowngrades) {
            return 'Once you confirm, your changes will take effect immediately.'
        }

        if (hasDowngrades && !hasUpgrades) {
            return `Once you confirm, your changes will take effect at the end of your billing cycle on ${periodEnd}.`
        }

        return `Once you confirm, your upgraded and added products will take effect immediately and your downgraded products will take effect at the end of your billing cycle on ${periodEnd}.`
    }, [selectedPlans, plansByProduct, cancelledProducts, periodEnd])

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
