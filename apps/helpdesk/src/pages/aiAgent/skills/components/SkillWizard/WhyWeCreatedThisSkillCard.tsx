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

import css from './WhyWeCreatedThisSkillCard.less'

type GuidanceSource = {
    id: number
    title: string
    url: string
}

type Props = {
    recommendation: string
    estimatedImpact: string
    guidanceSources: GuidanceSource[]
}

export const WhyWeCreatedThisSkillCard = ({
    recommendation,
    estimatedImpact,
    guidanceSources,
}: Props) => {
    const guidanceCount = guidanceSources.length
    const guidanceLabel = guidanceCount === 1 ? 'guidance' : 'guidances'
    const shouldShowGuidanceSource = guidanceCount > 0

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
                {shouldShowGuidanceSource && (
                    <Box flexDirection="row" alignItems="center" gap="xxxs">
                        <Text
                            size="sm"
                            color="var(--content-neutral-secondary)"
                        >
                            Generated from {guidanceCount} {guidanceLabel}
                        </Text>
                        <Tooltip
                            delay={0}
                            closeDelay={500}
                            trigger={
                                <Icon
                                    name="info"
                                    size="xs"
                                    color="var(--content-neutral-secondary)"
                                    aria-label="Why we created this skill info"
                                />
                            }
                        >
                            <TooltipContent>
                                <Box
                                    width="100%"
                                    flexDirection="column"
                                    gap="xxxs"
                                    className={css.tooltipContent}
                                >
                                    <Text size="sm">
                                        We generated this skill by analyzing
                                        your ticket data and existing guidance.
                                    </Text>
                                    <Box flexDirection="column">
                                        {guidanceSources.map((source) => (
                                            <Box
                                                key={source.id}
                                                flexDirection="row"
                                                alignItems="center"
                                                gap="xxxs"
                                            >
                                                <Text size="sm">•</Text>
                                                <Box
                                                    className={
                                                        css.tooltipLinkWrapper
                                                    }
                                                >
                                                    <a
                                                        href={source.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {source.title}
                                                    </a>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                    <Text size="sm">
                                        At the end of your review, we&apos;ll
                                        show which guidance has become redundant
                                        so you can archive it.
                                    </Text>
                                </Box>
                            </TooltipContent>
                        </Tooltip>
                    </Box>
                )}
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
