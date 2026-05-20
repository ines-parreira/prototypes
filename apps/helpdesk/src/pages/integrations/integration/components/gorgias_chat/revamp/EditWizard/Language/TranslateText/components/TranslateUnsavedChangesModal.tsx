import {
    Box,
    Button,
    ButtonIntent,
    ButtonSize,
    ButtonVariant,
    Modal,
    ModalSize,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

type Props = {
    isOpen: boolean
    description: string
    onSave: () => void
    onDiscard: () => void
    onClose: () => void
}

export const TranslateUnsavedChangesModal = ({
    isOpen,
    description,
    onSave,
    onDiscard,
    onClose,
}: Props) => {
    return (
        <Modal
            size={ModalSize.Md}
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
        >
            <OverlayHeader title="Unsaved changes" />
            <OverlayContent>
                <Text>{description}</Text>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs">
                    <Button
                        intent={ButtonIntent.Destructive}
                        size={ButtonSize.Md}
                        variant={ButtonVariant.Secondary}
                        onClick={onDiscard}
                    >
                        Discard changes
                    </Button>
                    <Button
                        intent={ButtonIntent.Regular}
                        size={ButtonSize.Md}
                        variant={ButtonVariant.Primary}
                        onClick={onSave}
                    >
                        Save changes
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
