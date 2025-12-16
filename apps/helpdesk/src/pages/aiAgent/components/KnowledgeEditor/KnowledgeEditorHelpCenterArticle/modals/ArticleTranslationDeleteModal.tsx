import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import { useDeleteTranslationModal } from './useDeleteTranslationModal'

export const ArticleTranslationDeleteModal = () => {
    const { isOpen, isDeleting, locale, onClose, onDelete } =
        useDeleteTranslationModal()

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose}>
            <OverlayHeader
                title={
                    <span>
                        Are you sure you want to delete {locale?.label} for this
                        article?
                    </span>
                }
            />
            <OverlayContent>
                <Box h="200px">
                    <Text>
                        You will lose all content saved and published of this
                        language ({locale?.label}) for this article. You
                        can&apos;t undo this action, you&apos;ll have to compose
                        again all the content for this language if you decide to
                        add it.
                    </Text>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end" width="100%">
                    <Button
                        variant="secondary"
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
                        Delete {locale?.text}
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
