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
    isDisabling: boolean
    onClose: () => void
    onDisable: () => Promise<void>
}

export const KnowledgeEditorSidePanelGuidanceDisableIntentsModal = ({
    isOpen,
    isDisabling,
    onClose,
    onDisable,
}: Props) => {
    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onClose}
            size="sm"
            aria-label="Disable guidance and unlink intents"
        >
            <OverlayHeader title="Disable guidance and unlink intents?" />
            <OverlayContent>
                <Box paddingBottom="md">
                    <Text>
                        Disabling this guidance will unlink its intents, making
                        them available to link to other guidances.
                    </Text>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end" width="100%">
                    <Button
                        variant="tertiary"
                        onClick={onClose}
                        isDisabled={isDisabling}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        intent="destructive"
                        onClick={onDisable}
                        isLoading={isDisabling}
                    >
                        Disable
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
