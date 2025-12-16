import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import { useDiscardDraftModal } from './useDiscardDraftModal'

export const ArticleDiscardDraftModal = () => {
    const { isOpen, isDiscarding, onClose, onDiscard } = useDiscardDraftModal()

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose}>
            <OverlayHeader title="Discard draft?" />
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
                        variant="secondary"
                        onClick={onClose}
                        isDisabled={isDiscarding}
                    >
                        Back to editing
                    </Button>
                    <Button
                        variant="primary"
                        intent="destructive"
                        onClick={onDiscard}
                        isLoading={isDiscarding}
                    >
                        Discard draft
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
