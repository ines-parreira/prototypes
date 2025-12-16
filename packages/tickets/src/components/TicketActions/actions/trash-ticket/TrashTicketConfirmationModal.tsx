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

import { useTrashTicket } from './useTrashTicket'

type TrashTicketConfirmationModalProps = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    ticketId: number
}
export function TrashTicketConfirmationModal({
    isOpen,
    onOpenChange,
    ticketId,
}: TrashTicketConfirmationModalProps) {
    const { trashTicket } = useTrashTicket(ticketId)

    const handleDeleteTicket = useCallback(async () => {
        await trashTicket(ticketId, {
            trashed_datetime: new Date().toISOString(),
        })
        onOpenChange(false)
    }, [trashTicket, ticketId, onOpenChange])

    return (
        <Modal size={ModalSize.Sm} isOpen={isOpen} onOpenChange={onOpenChange}>
            <OverlayHeader title="Are you sure?" />
            <OverlayContent>
                <Text>
                    You are about to <Text variant="bold">delete</Text> this
                    ticket.
                </Text>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" width="100%" justifyContent="flex-end">
                    <Button
                        variant="tertiary"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        intent="destructive"
                        onClick={handleDeleteTicket}
                    >
                        Delete ticket
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
