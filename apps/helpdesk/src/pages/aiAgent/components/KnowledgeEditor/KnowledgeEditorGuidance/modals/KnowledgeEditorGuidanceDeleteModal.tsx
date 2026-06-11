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
    const {
        isOpen,
        isDeleting,
        hasBothVersions,
        onClose,
        onDelete,
        onDiscardDraft,
    } = useDeleteModal()

    const showDualChoice = hasBothVersions && state.mode === 'read'
    const cancelButtonText =
        state.mode === 'read' ? 'Cancel' : 'Back to editing'

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="sm">
            <OverlayHeader title="Delete?" />
            <OverlayContent>
                <Box paddingBottom="md">
                    <Text>
                        {showDualChoice ? (
                            'This guidance has both a published version and a draft.'
                        ) : (
                            <>
                                Once deleted, this content can&apos;t be
                                restored.
                                {hasBothVersions &&
                                    ' Both the draft and the published version will be permanently deleted.'}
                            </>
                        )}
                    </Text>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end" width="100%">
                    {showDualChoice ? (
                        <>
                            <Button
                                variant="tertiary"
                                onClick={onClose}
                                isDisabled={isDeleting}
                            >
                                {cancelButtonText}
                            </Button>
                            <Button
                                variant="tertiary"
                                intent="destructive"
                                onClick={onDelete}
                                isDisabled={isDeleting}
                                isLoading={isDeleting}
                            >
                                Delete guidance
                            </Button>
                            <Button
                                variant="primary"
                                intent="destructive"
                                onClick={onDiscardDraft}
                                isDisabled={isDeleting}
                            >
                                Discard draft
                            </Button>
                        </>
                    ) : (
                        <>
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
                                Delete guidance
                            </Button>
                        </>
                    )}
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
