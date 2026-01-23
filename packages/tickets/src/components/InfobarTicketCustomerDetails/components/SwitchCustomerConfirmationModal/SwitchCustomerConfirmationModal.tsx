import { useCallback } from 'react'

import {
    Box,
    Button,
    Modal,
    ModalSize,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'
import type { Customer } from '@gorgias/helpdesk-types'

type SwitchCustomerConfirmationModalProps = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    customer: Customer | null
    onConfirm: (customer: Customer) => void
}

export function SwitchCustomerConfirmationModal({
    isOpen,
    onOpenChange,
    customer,
    onConfirm,
}: SwitchCustomerConfirmationModalProps) {
    const customerName = customer?.name || `Customer #${customer?.id}`

    const handleConfirm = useCallback(() => {
        if (customer) {
            onConfirm(customer)
            onOpenChange(false)
        }
    }, [customer, onConfirm, onOpenChange])

    return (
        <Modal size={ModalSize.Md} isOpen={isOpen} onOpenChange={onOpenChange}>
            <OverlayHeader title="Change ticket customer?" />
            <OverlayContent paddingBottom="md">
                <Text>
                    Are you sure that you want to set {customerName} as the
                    customer for this ticket?
                </Text>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="sm" width="100%" justifyContent="flex-end">
                    <Button
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleConfirm}>
                        Confirm
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
