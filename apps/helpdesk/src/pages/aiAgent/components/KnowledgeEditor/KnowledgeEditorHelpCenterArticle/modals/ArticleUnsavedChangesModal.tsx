import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import { useUnsavedChangesModal } from './useUnsavedChangesModal'

export const ArticleUnsavedChangesModal = () => {
    const { isOpen, onClose, onDiscard } = useUnsavedChangesModal()

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose}>
            <OverlayHeader title="Discard unsaved changes?" />
            <OverlayContent>
                <Box paddingBottom="md">
                    <Text>
                        Your changes will be lost if you don&apos;t save them.
                    </Text>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end" width="100%">
                    <Button variant="secondary" onClick={onClose}>
                        Back to editing
                    </Button>
                    <Button
                        variant="primary"
                        intent="destructive"
                        onClick={onDiscard}
                    >
                        Discard changes
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
