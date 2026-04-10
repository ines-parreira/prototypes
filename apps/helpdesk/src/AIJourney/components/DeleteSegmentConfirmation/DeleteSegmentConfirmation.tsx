import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

type Props = {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}

const DeleteSegmentConfirmation = ({ isOpen, onClose, onConfirm }: Props) => {
    return (
        <Modal size="sm" isOpen={isOpen} isDismissable onOpenChange={onClose}>
            <OverlayHeader title="Delete segment?" />
            <OverlayContent>
                <Box gap="xs">
                    <Text color="var(--content-neutral-secondary)">
                        This segment will be permanently removed. This action
                        can&apos;t be undone.
                    </Text>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box width="100%" gap="xs" justifyContent="flex-end">
                    <Button variant="tertiary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        intent="destructive"
                    >
                        Delete segment
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}

export default DeleteSegmentConfirmation
