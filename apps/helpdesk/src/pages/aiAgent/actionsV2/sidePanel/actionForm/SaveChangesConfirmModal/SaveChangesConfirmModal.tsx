import {
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

type Props = {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
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
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
            <OverlayHeader title="Save changes?" />
            <OverlayContent>
                <Text size="md" color="content-neutral-default">
                    Your changes to this page will be lost if you don&apos;t
                    save them.
                </Text>
            </OverlayContent>
            <OverlayFooter>
                <Button
                    variant="tertiary"
                    intent="destructive"
                    onClick={() => {
                        onOpenChange(false)
                        onDiscard()
                    }}
                >
                    Discard Changes
                </Button>
                <Button
                    variant="secondary"
                    intent="regular"
                    onClick={() => onOpenChange(false)}
                >
                    Back To Editing
                </Button>
                <Button
                    variant="primary"
                    intent="regular"
                    onClick={() => {
                        onOpenChange(false)
                        onSave()
                    }}
                >
                    Save Changes
                </Button>
            </OverlayFooter>
        </Modal>
    )
}
