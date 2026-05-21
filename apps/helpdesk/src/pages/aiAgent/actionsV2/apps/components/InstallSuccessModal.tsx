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
    appName: string
    onViewActions: () => void
}

export const InstallSuccessModal = ({
    isOpen,
    onOpenChange,
    appName,
    onViewActions,
}: InstallSuccessModalProps) => {
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm">
            <OverlayHeader
                title={<Heading size="lg">Connected to {appName}</Heading>}
            />
            <OverlayContent display="block">
                <Text>
                    Your actions from this app are now available in AI Agent
                    settings. Insert them in{' '}
                    <Text as="span" variant="bold">
                        skills
                    </Text>{' '}
                    and{' '}
                    <Text as="span" variant="bold">
                        guidance
                    </Text>{' '}
                    for AI Agent to perform actions on your behalf.
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
