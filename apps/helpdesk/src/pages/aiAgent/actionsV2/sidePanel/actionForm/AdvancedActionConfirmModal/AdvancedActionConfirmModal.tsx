import {
    Banner,
    Box,
    Button,
    Heading,
    Icon,
    Link,
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
    learnMoreHref?: string
}

const BENEFITS = [
    'Build custom HTTP requests with apps not currently supported',
    'Collect information to use as input variables in HTTP requests',
    'Use conditional logic with variables between Action steps',
]

export const AdvancedActionConfirmModal = ({
    isOpen,
    onOpenChange,
    onConfirm,
    learnMoreHref,
}: Props) => {
    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="md"
            isDismissable={false}
        >
            <OverlayHeader title="Advanced options for Actions" />
            <OverlayContent gap="md" flexDirection="column">
                <Heading size="sm">
                    Need more functionality? Convert this Action to the Advanced
                    View
                </Heading>
                <Box flexDirection="column" gap="xs">
                    {BENEFITS.map((benefit) => (
                        <Box
                            key={benefit}
                            flexDirection="row"
                            alignItems="flex-start"
                            gap="xs"
                        >
                            <Icon
                                name="check"
                                size="sm"
                                color="content-neutral-secondary"
                            />
                            <Text size="sm" color="content-neutral-default">
                                {benefit}
                            </Text>
                        </Box>
                    ))}
                </Box>
                {learnMoreHref && (
                    <Link
                        href={learnMoreHref}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Learn more about advanced options for Actions
                    </Link>
                )}
                <Banner intent="warning" isClosable={false}>
                    Converting an Action to the advanced view cannot be undone
                    after saving. Technical knowledge may be required to use
                    advanced features.
                </Banner>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end" width="100%">
                    <Button
                        variant="secondary"
                        intent="regular"
                        onClick={() => onOpenChange(false)}
                    >
                        Back To Editing
                    </Button>
                    <Button
                        variant="primary"
                        intent="destructive"
                        onClick={() => {
                            onConfirm()
                            onOpenChange(false)
                        }}
                    >
                        Convert To Advanced View
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
