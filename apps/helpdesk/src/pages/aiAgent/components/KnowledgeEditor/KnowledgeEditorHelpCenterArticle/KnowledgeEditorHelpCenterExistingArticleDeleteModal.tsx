import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import type { KnowledgeEditorHelpCenterArticleModalState } from './hooks/useKnowledgeEditorHelpCenterArticleModal'

export const KnowledgeEditorHelpCenterExistingArticleDeleteModal = (
    props: Extract<
        KnowledgeEditorHelpCenterArticleModalState,
        { type: 'confirm-delete' }
    >,
) => (
    <Modal isOpen={true} onOpenChange={props.onClose}>
        <OverlayHeader
            title={
                props.resource.kind === 'article' ? (
                    <span>Are you sure you want to delete this article?</span>
                ) : (
                    <span>
                        Are you sure you want to delete{' '}
                        {props.resource.locale.label} for this article?
                    </span>
                )
            }
        />
        <OverlayContent>
            <Box h="200px">
                <Text>
                    {props.resource.kind === 'article' ? (
                        <span>
                            You will lose all content saved and published of
                            this article. You can’t undo this action, you’ll
                            have to compose again all the content for this
                            article if you decide to add it.
                        </span>
                    ) : (
                        <span>
                            You will lose all content saved and published of
                            this language ({props.resource.locale.label}) for
                            this article. You can’t undo this action, you’ll
                            have to compose again all the content for this
                            language if you decide to add it.
                        </span>
                    )}
                </Text>
            </Box>
        </OverlayContent>
        <OverlayFooter>
            <Box gap="xs">
                <Button
                    variant="primary"
                    intent="destructive"
                    onClick={props.onConfirm}
                >
                    {props.resource.kind === 'article'
                        ? 'Delete article'
                        : `Delete ${props.resource.locale.text}`}
                </Button>
            </Box>
        </OverlayFooter>
    </Modal>
)
