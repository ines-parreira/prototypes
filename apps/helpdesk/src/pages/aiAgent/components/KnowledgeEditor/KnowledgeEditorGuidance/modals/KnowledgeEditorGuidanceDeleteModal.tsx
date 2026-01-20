import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import { useGuidanceContext } from '../context'
import { useDeleteModal } from './useDeleteModal'

export const KnowledgeEditorGuidanceDeleteModal = () => {
    const { state } = useGuidanceContext()
    const { isOpen, isDeleting, hasBothVersions, onClose, onDelete } =
        useDeleteModal()

    const cancelButtonText =
        state.guidanceMode === 'read' ? 'Cancel' : 'Back to editing'

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="sm">
            <OverlayHeader title="Delete?" />
            <OverlayContent>
                <Box paddingBottom="md">
                    <Text>
                        Once deleted, this content can&apos;t be restored.
                        {hasBothVersions &&
                            ' Both the draft and the published version will be permanently deleted.'}
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
                        {cancelButtonText}
                    </Button>
                    <Button
                        variant="primary"
                        intent="destructive"
                        onClick={onDelete}
                        isLoading={isDeleting}
                    >
                        Delete
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
