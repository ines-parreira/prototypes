import { Box, Button, Card, Heading, Icon, Text } from '@gorgias/axiom'

const BULLETS = [
    'Leads customers to fast resolutions in seconds, not hours.',
    'Enhances team productivity, reducing workload and response times by automating up to 60% of your tickets.',
    'Offers skills and actions to automate workflows that normally require manual changes in third-party tools, like fulfilling order data or updating shipping addresses.',
]

type Props = {
    ctaHref: string
    learnMoreHref: string
    onDismiss: () => void
}

export default function AiAgentUpsellBanner({
    ctaHref,
    learnMoreHref,
    onDismiss,
}: Props) {
    return (
        <Card
            elevation="mid"
            flexDirection="column"
            gap="md"
            padding="lg"
            style={{ backgroundColor: 'var(--surface-neutral-secondary)' }}
        >
            <Box flexDirection="column" gap="xxs">
                <Box justifyContent="space-between" alignItems="flex-start">
                    <Heading size="lg">
                        Unlock AI Agent: Your new team member that automates
                        support in 1:1 conversations
                    </Heading>
                    <Button
                        icon="close"
                        variant="tertiary"
                        size="sm"
                        onClick={onDismiss}
                        aria-label="Dismiss"
                    />
                </Box>
                <Box flexDirection="column" gap="xxxs">
                    {BULLETS.map((bullet) => (
                        <Box key={bullet} gap="xxxs" alignItems="center">
                            <Icon
                                name="check-circle"
                                size="sm"
                                color="var(--content-success-default)"
                            />
                            <Text>{bullet}</Text>
                        </Box>
                    ))}
                </Box>
            </Box>
            <Box gap="xs">
                <Button as="a" href={ctaHref} size="md">
                    Try for free
                </Button>
                <Button
                    as="a"
                    href={learnMoreHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="tertiary"
                    size="md"
                >
                    Learn more
                </Button>
            </Box>
        </Card>
    )
}
