import {
    Box,
    Button,
    Icon,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

type Props = {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    onConfirm: () => void
}

const BENEFITS = [
    'Connect to apps beyond the App Store',
    'Pull in dynamic data to use across steps',
    'Add if/then logic to control what happens next',
]

export const BuildAdvancedModeModal = ({
    isOpen,
    onOpenChange,
    onConfirm,
}: Props) => {
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm">
            <OverlayHeader title="Build with advanced mode" />
            <OverlayContent gap="md" marginBottom="sm" flexDirection="column">
                <Text size="md" color="content-neutral-default">
                    This switches your action to a visual editor. You can&apos;t
                    switch back to the standard editor after this. Advanced mode
                    lets you:
                </Text>
                <Box flexDirection="column" gap="sm">
                    {BENEFITS.map((benefit) => (
                        <Box
                            key={benefit}
                            flexDirection="row"
                            alignItems="flex-start"
                            gap="xs"
                        >
                            <Icon
                                name="check-circle"
                                size="md"
                                color="content-success-default"
                            />
                            <Text size="md" color="content-neutral-default">
                                {benefit}
                            </Text>
                        </Box>
                    ))}
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton pb="md">
                <Box gap="xs" justifyContent="flex-end" width="100%">
                    <Button
                        variant="tertiary"
                        intent="regular"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        intent="destructive"
                        onClick={() => {
                            onConfirm()
                            onOpenChange(false)
                        }}
                    >
                        Build advanced action
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
