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
    onUnlink: () => void
}

export const KnowledgeEditorSidePanelSectionLinkedIntentsUnlinkModal = ({
    isOpen,
    onClose,
    onUnlink,
}: Props) => {
    const handleModalOpenChange = (nextIsOpen: boolean) => {
        if (!nextIsOpen) {
            onClose()
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={handleModalOpenChange}
            size="sm"
            aria-label="Unlink intents from this guidance"
        >
            <OverlayHeader title="Unlink intents from this guidance?" />
            <OverlayContent>
                <Box paddingBottom="md">
                    <Text>
                        AI Agent won&apos;t prioritize this guidance when
                        responding to the linked intents.
                    </Text>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end" width="100%">
                    <Button variant="tertiary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        intent="destructive"
                        onClick={onUnlink}
                    >
                        Unlink
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
