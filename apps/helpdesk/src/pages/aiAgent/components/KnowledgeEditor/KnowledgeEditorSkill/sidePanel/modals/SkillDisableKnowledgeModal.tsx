import {
    Box,
    Button,
    Heading,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

type Props = {
    isOpen: boolean
    isLoading: boolean
    onClose: () => void
    onDisable: () => void
}

export const SkillDisableKnowledgeModal = ({
    isOpen,
    onClose,
    onDisable,
    isLoading,
}: Props) => {
    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onClose}
            size="sm"
            aria-label="Disable knowledge"
        >
            <OverlayHeader
                title={<Heading size="lg">Disable knowledge?</Heading>}
            />
            <OverlayContent>
                <Box paddingBottom="md" mb={10}>
                    <Text>
                        AI Agent won&apos;t use supporting knowledge for this
                        skill. Customer questions not covered by your
                        instructions may go unanswered. We recommend keeping
                        this enabled.
                    </Text>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box flexDirection="row" justifyContent="flex-end" gap="sm">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        isDisabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        intent="destructive"
                        onClick={onDisable}
                        isLoading={isLoading}
                        isDisabled={isLoading}
                    >
                        Disable
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
