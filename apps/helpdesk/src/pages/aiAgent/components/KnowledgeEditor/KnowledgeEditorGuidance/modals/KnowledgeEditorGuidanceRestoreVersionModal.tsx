import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import { useRestoreVersionModal } from './useRestoreVersionModal'

export const KnowledgeEditorGuidanceRestoreVersionModal = () => {
    const { isOpen, isRestoring, onClose, onRestore } = useRestoreVersionModal()

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="sm">
            <OverlayHeader title="Restore this version?" />
            <OverlayContent>
                <Box paddingBottom="md">
                    <Text>
                        Restoring this version will create a new draft with its
                        content. Any existing draft will be overwritten.
                    </Text>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end" width="100%">
                    <Button
                        variant="tertiary"
                        onClick={onClose}
                        isDisabled={isRestoring}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onRestore}
                        isLoading={isRestoring}
                    >
                        Restore version
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
