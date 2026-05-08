import {
    Box,
    Card,
    Icon,
    Tag,
    TagColor,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

type Props = {
    recommendation: string
    estimatedImpact: string
    guidanceCount: number
}

export const WhyWeCreatedThisSkillCard = ({
    recommendation,
    estimatedImpact,
    guidanceCount,
}: Props) => {
    const guidanceLabel = guidanceCount === 1 ? 'guidance' : 'guidances'

    return (
        <Card elevation="mid" flexDirection="column" gap="xs" width="100%">
            <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                gap="md"
            >
                <Text size="md" variant="bold">
                    Why we created this skill
                </Text>
                <Box flexDirection="row" alignItems="center" gap="xxxs">
                    <Text size="sm" color="var(--content-neutral-secondary)">
                        Generated from {guidanceCount} {guidanceLabel}
                    </Text>
                    <Tooltip
                        delay={0}
                        trigger={
                            <Icon
                                name="info"
                                size="xs"
                                color="var(--content-neutral-secondary)"
                                aria-label="Why we created this skill info"
                            />
                        }
                    >
                        <TooltipContent caption="We analyzed your existing guidance and ticket data to generate this skill. At the end of your review, we'll show you which guidance becomes redundant and you can archive them." />
                    </Tooltip>
                </Box>
            </Box>
            <Text size="md">{recommendation}</Text>
            <Box mt="xxxs">
                <Tag
                    color={TagColor.Purple}
                    size="md"
                    leadingSlot="trending-up"
                >
                    Estimated impact: {estimatedImpact} automation rate
                </Tag>
            </Box>
        </Card>
    )
}
