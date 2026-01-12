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

import { useDeleteCustomUserAvailabilityStatus } from '../../hooks/useDeleteCustomUserAvailabilityStatus'
import { useAgentStatusLegacyBridge } from '../../utils/LegacyBridge'
import { NotificationStatus } from '../../utils/LegacyBridge/context'

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
    const { dispatchNotification } = useAgentStatusLegacyBridge()
    const { mutateAsync, isLoading } = useDeleteCustomUserAvailabilityStatus()

    const handleDelete = useCallback(async () => {
        try {
            await mutateAsync({ pk: statusId })
            dispatchNotification({
                status: NotificationStatus.Success,
                message: `Status "${statusName}" has been deleted`,
                dismissAfter: 5000,
            })
            onOpenChange(false)
        } catch {
            dispatchNotification({
                status: NotificationStatus.Error,
                message: 'Failed to delete status. Please try again.',
            })
        }
    }, [mutateAsync, statusId, statusName, dispatchNotification, onOpenChange])

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
