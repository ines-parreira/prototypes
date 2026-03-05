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
    isLoading: boolean
    message: string
    onClose: () => void
    onRebase: () => Promise<void>
}

export const KnowledgeEditorSidePanelGuidanceVisibilityConflictModal = ({
    isOpen,
    isLoading,
    message,
    onClose,
    onRebase,
}: Props) => {
    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onClose}
            size="sm"
            aria-label="Resolve guidance visibility conflict"
        >
            <OverlayHeader title="This guidance can't be made visible yet" />
            <OverlayContent>
                <Box flexDirection="column" gap="sm" paddingBottom="md">
                    <Text>
                        This guidance shares intents with other published
                        guidance, so visibility cannot be set to public right
                        now.
                    </Text>
                    <Text>{message}</Text>
                    <Text>
                        If you continue, we will remove those conflicting
                        intents from the other guidance and then make this one
                        public.
                    </Text>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end" width="100%">
                    <Button
                        variant="tertiary"
                        onClick={onClose}
                        isDisabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onRebase}
                        isLoading={isLoading}
                    >
                        Override and make public
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
