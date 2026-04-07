import { useState } from 'react'

import {
    Box,
    Button,
    Modal,
    ModalSize,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
} from '@gorgias/axiom'

import type { BillingState } from 'models/billing/types'

import { ConfirmSummaryTable } from './ConfirmSummaryTable'
import type { ResolvedPlan } from './useInternalPlanEditor'

const INVOICE_ACTIONS = ['with', 'without'] as const
type InvoiceAction = (typeof INVOICE_ACTIONS)[number]

type InternalConfirmModalProps = {
    isOpen: boolean
    onClose: () => void
    resolvedPlans: ResolvedPlan[]
    billingState: BillingState
    onApply: (generateInvoice: boolean) => void
    isSubmitting: boolean
}

export function InternalConfirmModal({
    isOpen,
    onClose,
    resolvedPlans,
    billingState,
    onApply,
    isSubmitting,
}: InternalConfirmModalProps) {
    const [activeAction, setActiveAction] = useState<InvoiceAction | null>(null)

    function handleApply(action: InvoiceAction) {
        setActiveAction(action)
        onApply(action === 'with')
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size={ModalSize.Md}>
            <OverlayHeader
                title="Confirm changes"
                description="Once you confirm, your changes will take effect immediately."
            />
            <OverlayContent>
                <ConfirmSummaryTable
                    billingState={billingState}
                    resolvedPlans={resolvedPlans}
                />
            </OverlayContent>
            <OverlayFooter>
                <Box gap="sm">
                    <Button
                        variant="secondary"
                        onClick={() => handleApply('without')}
                        isLoading={isSubmitting && activeAction === 'without'}
                        isDisabled={isSubmitting}
                    >
                        Apply without invoice
                    </Button>
                    <Button
                        onClick={() => handleApply('with')}
                        isLoading={isSubmitting && activeAction === 'with'}
                        isDisabled={isSubmitting}
                    >
                        Apply with invoice
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
