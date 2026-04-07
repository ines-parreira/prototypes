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
    toast,
} from '@gorgias/axiom'

import { useDeleteCustomUserAvailabilityStatus } from '../../hooks/useDeleteCustomUserAvailabilityStatus'

type DeleteStatusConfirmationModalProps = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    statusId: string
    statusName: string
}

export function DeleteStatusConfirmationModal({
    isOpen,
    onOpenChange,
    statusId,
    statusName,
}: DeleteStatusConfirmationModalProps) {
    const { mutateAsync, isLoading } = useDeleteCustomUserAvailabilityStatus()

    const handleDelete = useCallback(async () => {
        try {
            await mutateAsync({ pk: statusId })
            toast.success(`Status "${statusName}" has been deleted`)
            onOpenChange(false)
        } catch {
            toast.error('Failed to delete status. Please try again.')
        }
    }, [mutateAsync, statusId, statusName, onOpenChange])

    return (
        <Modal size={ModalSize.Sm} isOpen={isOpen} onOpenChange={onOpenChange}>
            <OverlayHeader title="Delete status?" aria-label="Delete status?" />
            <OverlayContent>
                <Text>
                    You are about to delete{' '}
                    <Text variant="bold">{statusName}</Text>. This action cannot
                    be undone.
                </Text>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="sm">
                    <Button
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                        isDisabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        intent="destructive"
                        onClick={handleDelete}
                        isLoading={isLoading}
                    >
                        Delete status
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
