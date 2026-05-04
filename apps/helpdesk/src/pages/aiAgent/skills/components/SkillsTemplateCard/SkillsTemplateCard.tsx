import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Icon,
    Skeleton,
    Tag,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { TruncatedTextWithTooltip } from 'pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip'
import type { SkillTemplate } from 'pages/aiAgent/skills/types'
import { formatIntentName } from 'pages/aiAgent/skills/utils'

import css from './SkillsTemplateCard.less'

const MAX_VISIBLE_INTENTS = 2

export type SkillCoverageData =
    | {
          type: 'ticket-volume'
          ticketVolume: number
          ticketVolumePercent: number
      }
    | {
          type: 'automation-rate'
          automationRate: number
      }

export type SkillCoverage = {
    isLoading?: boolean
    hasAnyCoverage: boolean
    data: SkillCoverageData | null
}

type Props = {
    skillTemplate: SkillTemplate
    onCTA?: () => void
    coverage?: SkillCoverage | null
}

const getCoverageLabel = (data: SkillCoverageData | null): string | null => {
    if (!data) return null
    if (data.type === 'ticket-volume') {
        if (data.ticketVolume <= 0) return null
        return `Would cover ${data.ticketVolume.toLocaleString('en-US')} (${data.ticketVolumePercent}%) of your tickets`
    }
    if (data.automationRate <= 0) return null
    return `Estimated impact: +${data.automationRate}% automation rate`
}

export const SkillsTemplateCard: React.FC<Props> = ({
    skillTemplate,
    onCTA,
    coverage,
}) => {
    const hasLongIntentName = skillTemplate.intents.slice(0, 2).some(
        (intent) =>
            formatIntentName(intent.name)
                .split(' ')
                .filter((word) => word !== '/').length > 2,
    )
    const maxVisible = hasLongIntentName ? 1 : MAX_VISIBLE_INTENTS

    const displayedIntents = skillTemplate.intents.slice(0, maxVisible)
    const remainingCount = skillTemplate.intents.length - maxVisible
    const hiddenIntents = skillTemplate.intents.slice(maxVisible)

    const coverageLabel = getCoverageLabel(coverage?.data ?? null)
    const showCoverageContainer =
        !!coverage && (!!coverage.isLoading || coverage.hasAnyCoverage)

    return (
        <Card
            onClick={onCTA}
            gap="xl"
            color="content-neutral-default"
            className={css.card}
        >
            <CardHeader
                width="412px"
                gap="xs"
                title={
                    <Box minWidth={0} width="100%" className={css.titleWrapper}>
                        <TruncatedTextWithTooltip
                            tooltipContent={skillTemplate.name}
                        >
                            <Text variant="bold" size="md">
                                {skillTemplate.name}
                            </Text>
                        </TruncatedTextWithTooltip>
                    </Box>
                }
                description={
                    <Box flexDirection="column" gap="xxxs">
                        <Text size="xs" color="content-neutral-secondary">
                            Intents
                        </Text>
                        <Box className={css.tagsContainer}>
                            {displayedIntents.map((intent) => (
                                <Tag key={intent.name} size="sm">
                                    {formatIntentName(intent.name)}
                                </Tag>
                            ))}
                            {remainingCount > 0 && (
                                <Box className={css.tooltipWrapper}>
                                    <Tooltip
                                        trigger={
                                            <div className={css.remainingCount}>
                                                <Text variant="bold" size="sm">
                                                    +{remainingCount}
                                                </Text>
                                            </div>
                                        }
                                    >
                                        <TooltipContent>
                                            {hiddenIntents.map((intent) => (
                                                <Text
                                                    key={intent.name}
                                                    size="sm"
                                                >
                                                    {formatIntentName(
                                                        intent.name,
                                                    )}
                                                </Text>
                                            ))}
                                        </TooltipContent>
                                    </Tooltip>
                                </Box>
                            )}
                        </Box>
                    </Box>
                }
            />
            {showCoverageContainer && (
                <CardContent>
                    {coverage?.isLoading ? (
                        <Skeleton width="240px" height="24px" />
                    ) : coverageLabel ? (
                        <Tag
                            size="sm"
                            color="purple"
                            leadingSlot={<Icon name="trending-up" />}
                        >
                            {coverageLabel}
                        </Tag>
                    ) : null}
                </CardContent>
            )}
        </Card>
    )
}
