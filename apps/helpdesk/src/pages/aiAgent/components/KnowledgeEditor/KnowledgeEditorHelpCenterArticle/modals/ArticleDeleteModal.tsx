import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import { useDeleteArticleModal } from './useDeleteArticleModal'

export const ArticleDeleteModal = () => {
    const { isOpen, isDeleting, onClose, onDelete } = useDeleteArticleModal()

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose}>
            <OverlayHeader title="Delete?" />
            <OverlayContent>
                <Box paddingBottom="md">
                    <Text>
                        Once deleted, this content can&apos;t be restored. Both
                        the draft and the published version will be permanently
                        deleted.
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
                        Delete
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
