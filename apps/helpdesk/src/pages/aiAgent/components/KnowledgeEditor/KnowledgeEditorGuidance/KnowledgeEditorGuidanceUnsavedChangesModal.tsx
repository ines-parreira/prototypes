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
    onBackToEditing: () => void
    onDiscard: () => void
    onSave: () => void
}

export const KnowledgeEditorGuidanceUnsavedChangesModal = (props: Props) => (
    <Modal isOpen={props.isOpen} onOpenChange={props.onBackToEditing}>
        <OverlayHeader title="Save changes?" />
        <OverlayContent>
            <Text>Your changes will be lost if you don&apos;t save them.</Text>
        </OverlayContent>
        <OverlayFooter hideCancelButton>
            <Box display="flex" justifyContent="space-between" w="100%">
                <Button
                    variant="tertiary"
                    intent="destructive"
                    onClick={props.onDiscard}
                >
                    Discard changes
                </Button>
                <Box display="flex" gap="xs">
                    <Button variant="secondary" onClick={props.onBackToEditing}>
                        Back to editing
                    </Button>
                    <Button variant="primary" onClick={props.onSave}>
                        Save Changes
                    </Button>
                </Box>
            </Box>
        </OverlayFooter>
    </Modal>
)
