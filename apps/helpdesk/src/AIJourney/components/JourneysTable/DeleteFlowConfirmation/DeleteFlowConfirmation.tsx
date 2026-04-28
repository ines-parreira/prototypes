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
    flowName: string
    isOpen: boolean
    isLoading?: boolean
    onClose: () => void
    onConfirm: () => void
}

export const DeleteFlowConfirmation = ({
    flowName,
    isOpen,
    isLoading = false,
    onClose,
    onConfirm,
}: Props) => {
    return (
        <Modal size="sm" isOpen={isOpen} isDismissable={false}>
            <OverlayHeader title={`Delete ${flowName}?`} />
            <OverlayContent>
                <Box gap="xs">
                    <Text>
                        {`This will permanently remove the flow and its webhook URL. This cannot be undone.`}
                    </Text>
                </Box>
            </OverlayContent>
            <OverlayFooter>
                <Box gap="xs">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        intent="destructive"
                        isDisabled={isLoading}
                        isLoading={isLoading}
                    >
                        Delete
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
