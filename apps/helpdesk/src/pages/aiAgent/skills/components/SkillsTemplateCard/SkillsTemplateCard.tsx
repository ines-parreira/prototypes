import { useMemo } from 'react'

import classNames from 'classnames'

import {
    Box,
    Button,
    Card,
    Skeleton,
    Tag,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { CUSTOM_FIELD_AI_AGENT_HANDOVER } from 'domains/reporting/hooks/automate/types'
import { getLast28DaysDateRange } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { IntentMetric } from 'domains/reporting/state/ui/stats/types'
import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { TruncatedTextWithTooltip } from 'pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { MetricCell } from 'pages/aiAgent/skills/components/SharedTableComponents/MetricCells'
import type { IntentMetrics } from 'pages/aiAgent/skills/hooks/useIntentsTable'
import type { SkillTemplate } from 'pages/aiAgent/skills/types'
import { formatIntentName } from 'pages/aiAgent/skills/utils'

import css from './SkillsTemplateCard.less'

const MAX_VISIBLE_INTENTS = 2

type Props = {
    skillTemplate: SkillTemplate
    onCreateSkillsFromTemplate: () => void
    className?: string
    hasStats?: boolean
    hasCTA?: boolean
    hasActiveCTA?: boolean
    stats?: IntentMetrics | null
    isLoadingStats?: boolean
}

export const SkillsTemplateCard: React.FC<Props> = ({
    skillTemplate,
    onCreateSkillsFromTemplate,
    className,
    hasStats = false,
    hasCTA = false,
    hasActiveCTA = false,
    stats = null,
    isLoadingStats = false,
}) => {
    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const shopName = storeConfiguration?.storeName || ''
    const integrationIds = useGetTicketChannelsStoreIntegrations(shopName)
    const { intentCustomFieldId, outcomeCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()
    const metricsDateRange = useMemo(() => getLast28DaysDateRange(), [])

    const intentFieldValues = useMemo(
        () => skillTemplate.intents.map((i) => i.name),
        [skillTemplate.intents],
    )

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

    const ticketVolumeDisplay =
        stats && stats.ticketVolume > 0
            ? `${stats.ticketVolume.toLocaleString('en-US')} (${stats.ticketVolumePercent}%)`
            : '--'

    const handoverDisplay =
        stats && stats.handoverCount > 0
            ? `${stats.handoverCount.toLocaleString('en-US')} (${stats.handoverPercent}%)`
            : '--'

    return (
        <Card
            className={classNames(css.card, className)}
            onClick={!hasCTA ? onCreateSkillsFromTemplate : undefined}
            withHoverEffect={!hasCTA}
            gap="sm"
            color="content-neutral-default"
        >
            <Box display="flex" flexDirection="column" gap="xs">
                <TruncatedTextWithTooltip tooltipContent={skillTemplate.name}>
                    <Text variant="bold" size="md">
                        {skillTemplate.name}
                    </Text>
                </TruncatedTextWithTooltip>
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
                                            <Text key={intent.name} size="sm">
                                                {formatIntentName(intent.name)}
                                            </Text>
                                        ))}
                                    </TooltipContent>
                                </Tooltip>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
            {!!hasStats && (
                <Box gap="xl" className={css.stats}>
                    <Box flexDirection="column" gap="xxxs">
                        <Text size="xs" color="content-neutral-secondary">
                            Ticket volume
                        </Text>
                        {isLoadingStats ? (
                            <Skeleton width="80px" height="16px" />
                        ) : (
                            <MetricCell
                                type="intent"
                                metricName={IntentMetric.TicketVolume}
                                title="Ticket volume"
                                intentFieldValues={intentFieldValues}
                                integrationIds={integrationIds}
                                dateRange={metricsDateRange}
                                outcomeCustomFieldId={outcomeCustomFieldId}
                                intentCustomFieldId={intentCustomFieldId}
                                value={stats?.ticketVolume ?? 0}
                                displayValue={ticketVolumeDisplay}
                                isBold
                            />
                        )}
                    </Box>
                    <Box flexDirection="column" gap="xxxs">
                        <Text size="xs" color="content-neutral-secondary">
                            Handover
                        </Text>
                        {isLoadingStats ? (
                            <Skeleton width="130px" height="16px" />
                        ) : (
                            <MetricCell
                                type="intent"
                                metricName={IntentMetric.Handover}
                                title="Handover tickets"
                                intentFieldValues={intentFieldValues}
                                integrationIds={integrationIds}
                                dateRange={metricsDateRange}
                                outcomeCustomFieldId={outcomeCustomFieldId}
                                intentCustomFieldId={intentCustomFieldId}
                                outcomeValue={CUSTOM_FIELD_AI_AGENT_HANDOVER}
                                value={stats?.handoverPercent ?? 0}
                                displayValue={handoverDisplay}
                                showProgressBar={
                                    !!stats && stats.handoverCount > 0
                                }
                                isRow
                                isBold
                            />
                        )}
                    </Box>
                </Box>
            )}
            {!!hasCTA && (
                <Box>
                    <Button
                        size="sm"
                        onClick={onCreateSkillsFromTemplate}
                        variant={hasActiveCTA ? 'primary' : 'secondary'}
                    >
                        Set up skill
                    </Button>
                </Box>
            )}
        </Card>
    )
}
