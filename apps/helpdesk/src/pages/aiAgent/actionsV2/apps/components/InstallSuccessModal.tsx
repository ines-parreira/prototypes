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

interface InstallSuccessModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onViewActions: () => void
}

export const InstallSuccessModal = ({
    isOpen,
    onOpenChange,
    onViewActions,
}: InstallSuccessModalProps) => {
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm">
            <OverlayHeader
                title={
                    <Heading size="lg">
                        Actions are now available in your store
                    </Heading>
                }
            />
            <OverlayContent display="block">
                <Text>
                    Manage your actions from the AI Agent settings. Actions can
                    be inserted in{' '}
                    <Text as="span" variant="bold">
                        skills
                    </Text>{' '}
                    and{' '}
                    <Text as="span" variant="bold">
                        guidance
                    </Text>{' '}
                    for AI Agent to perform them on your behalf.
                </Text>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="sm" justifyContent="flex-end" width="100%">
                    <Button
                        variant="tertiary"
                        onClick={() => onOpenChange(false)}
                    >
                        Dismiss
                    </Button>
                    <Button variant="primary" autoFocus onClick={onViewActions}>
                        View actions
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
