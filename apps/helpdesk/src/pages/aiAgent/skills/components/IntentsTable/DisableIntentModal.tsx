import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

interface DisableIntentModalProps {
    isOpen: boolean
    trafficPercent?: number
    isLoading?: boolean
    onClose: () => void
    onConfirm: () => void
}

export const DisableIntentModal = ({
    isOpen,
    trafficPercent,
    isLoading = false,
    onClose,
    onConfirm,
}: DisableIntentModalProps) => {
    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="sm">
            <OverlayHeader title="Disable intent?" />
            <OverlayContent>
                {trafficPercent !== undefined ? (
                    <Text>
                        AI Agent will stop handling this intent entirely and
                        will automatically hand over tickets for{' '}
                        <Text as="span" variant="bold">
                            {trafficPercent}% of your traffic.
                        </Text>
                    </Text>
                ) : (
                    <Text>
                        AI Agent will stop handling this intent entirely and
                        will automatically hand over tickets matching this
                        intent.
                    </Text>
                )}
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="sm" justifyContent="flex-end" width="100%">
                    <Button variant="tertiary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        intent="destructive"
                        onClick={onConfirm}
                        isLoading={isLoading}
                    >
                        Disable
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
