import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

type DeleteDraftModalProps = {
    isOpen: boolean
    isDeleting: boolean
    onClose: () => void
    onDelete: () => void
}

export const DeleteDraftModal = ({
    isOpen,
    isDeleting,
    onClose,
    onDelete,
}: DeleteDraftModalProps) => {
    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="sm">
            <OverlayHeader title="Delete draft?" />
            <OverlayContent>
                <Box paddingBottom="md">
                    <Text>
                        Your draft will be permanently deleted, this content
                        can&apos;t be restored.
                    </Text>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end" width="100%">
                    <Button
                        variant="tertiary"
                        onClick={onClose}
                        isDisabled={isDeleting}
                    >
                        Back to editing
                    </Button>
                    <Button
                        variant="primary"
                        intent="destructive"
                        onClick={onDelete}
                        isLoading={isDeleting}
                    >
                        Delete draft
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
