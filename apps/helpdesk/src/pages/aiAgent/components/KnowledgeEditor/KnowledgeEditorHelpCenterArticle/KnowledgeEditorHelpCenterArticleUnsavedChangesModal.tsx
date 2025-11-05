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
    onCancel: () => void
    onDiscard: () => void
    onSave: () => void
}

export const KnowledgeEditorHelpCenterArticleUnsavedChangesModal = (
    props: Props,
) => (
    <Modal isOpen={props.isOpen} onOpenChange={props.onCancel}>
        <OverlayHeader title="Save changes?" />
        <OverlayContent>
            <Box h="200px">
                <Text>
                    Your changes to this page will be lost if you don’t save
                    them.
                </Text>
            </Box>
        </OverlayContent>
        <OverlayFooter>
            <Box gap="xs">
                <Button variant="secondary" onClick={props.onDiscard}>
                    Discard Changes
                </Button>
                <Button variant="primary" onClick={props.onSave}>
                    Save Changes
                </Button>
            </Box>
        </OverlayFooter>
    </Modal>
)
