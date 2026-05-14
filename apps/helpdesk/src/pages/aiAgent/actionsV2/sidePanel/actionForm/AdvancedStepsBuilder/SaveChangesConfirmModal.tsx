import {
    Box,
    Button,
    Modal,
    ModalSize,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

type Props = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onDiscard: () => void
    onSave: () => void
}

export const SaveChangesConfirmModal = ({
    isOpen,
    onOpenChange,
    onDiscard,
    onSave,
}: Props) => {
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size={ModalSize.Sm}>
            <OverlayHeader title="Save changes?" />
            <OverlayContent>
                <Text>
                    You have unsaved changes to this advanced action. Save them
                    before leaving, or discard to revert.
                </Text>
            </OverlayContent>
            <OverlayFooter>
                <Box flexDirection="row" gap="sm" justifyContent="flex-end">
                    <Button
                        as="button"
                        variant="tertiary"
                        size="md"
                        intent="regular"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        as="button"
                        variant="secondary"
                        size="md"
                        intent="destructive"
                        onClick={onDiscard}
                    >
                        Discard changes
                    </Button>
                    <Button
                        as="button"
                        variant="primary"
                        size="md"
                        intent="regular"
                        onClick={onSave}
                    >
                        Save changes
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
