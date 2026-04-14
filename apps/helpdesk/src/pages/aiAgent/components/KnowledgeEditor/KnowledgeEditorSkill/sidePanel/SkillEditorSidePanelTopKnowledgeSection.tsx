import { DrillDownModalTrigger } from '@repo/reporting'

import { Box, Card, Icon, Skeleton, Text } from '@gorgias/axiom'

import { KnowledgeMetric } from 'domains/reporting/state/ui/stats/types'
import { useSkillEditorStore } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/context'
import type { TopSupportingKnowledge } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillTopKnowledges'
import { formatDateRangeSubtitle } from 'pages/aiAgent/components/KnowledgeEditor/shared/useVersionHistoryBase/useVersionHistoryBase'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { TruncatedTextWithTooltip } from 'pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip'
import { typeConfig } from 'pages/aiAgent/KnowledgeHub/types'
import { useKnowledgeDrillDownTrigger } from 'pages/aiAgent/skills/hooks/useKnowledgeDrillDownTrigger'

import css from './SkillEditorSidePanel.less'

type Props = {
    topKnowledges: TopSupportingKnowledge[]
    isLoading: boolean
    dateRange: { start_datetime: string; end_datetime: string }
    historicalVersionDateRange?: {
        start_datetime: string
        end_datetime: string
    }
}

export const SkillEditorSidePanelTopKnowledgeSection = ({
    topKnowledges,
    isLoading,
    dateRange,
    historicalVersionDateRange,
}: Props) => {
    return (
        <Box width="100%" display="flex" flexDirection="column" gap="sm">
            <Box display="flex" flexDirection="column" gap="xxxxs">
                <Text variant="bold" size="sm">
                    Top knowledge used
                </Text>
                <Text size="xs" color="content-neutral-secondary">
                    {formatDateRangeSubtitle(historicalVersionDateRange)}
                </Text>
            </Box>
            {isLoading ? (
                <Box display="flex" flexDirection="column" gap="xs">
                    {[1, 2, 3].map((index) => (
                        <TopKnowledgeCardSkeleton key={index} />
                    ))}
                </Box>
            ) : (
                <Box display="flex" flexDirection="column" gap="xs">
                    {topKnowledges.map((item) => (
                        <TopKnowledgeCard
                            key={item.id}
                            knowledge={item}
                            dateRange={dateRange}
                        />
                    ))}
                </Box>
            )}
        </Box>
    )
}

const TopKnowledgeCard = ({
    knowledge,
    dateRange,
}: {
    knowledge: TopSupportingKnowledge
    dateRange: { start_datetime: string; end_datetime: string }
}) => {
    const {
        id,
        type,
        title,
        tickets: ticketCount,
        resourceSourceSetId,
        coUsedTicketIds,
    } = knowledge
    const icon = typeConfig[type].icon
    const { shopName, shopIntegrationId } = useSkillEditorStore(
        (storeState) => ({
            shopName: storeState.config.shopName,
            shopIntegrationId:
                storeState.config.helpCenter.shop_integration_id ?? 0,
        }),
    )
    const { routes } = useAiAgentNavigation({ shopName })

    const { openDrillDownModal } = useKnowledgeDrillDownTrigger({
        metricName: KnowledgeMetric.Tickets,
        title,
        resourceSourceId: Number(id),
        resourceSourceSetId,
        shopIntegrationId,
        dateRange,
        ticketIds: coUsedTicketIds,
    })

    const handleOnClick = () => {
        window.open(
            routes.knowledgeArticle(type, Number(id)),
            '_blank',
            'noopener,noreferrer',
        )
    }

    return (
        <Box
            className={css.knowledgeCard}
            padding="sm"
            gap="xs"
            alignItems="center"
            justifyContent="space-between"
        >
            <Box
                gap="xxxs"
                alignItems="center"
                className={css.knowledgeTitle}
                onClick={handleOnClick}
            >
                <Icon name={icon} size="xs" color="content-neutral-secondary" />
                <TruncatedTextWithTooltip tooltipContent={title}>
                    <Text size="sm">{title}</Text>
                </TruncatedTextWithTooltip>
            </Box>
            <Box gap="xxxxs" alignItems="center">
                <Icon
                    name="comm-chat"
                    size="xs"
                    color="content-neutral-secondary"
                />
                <DrillDownModalTrigger
                    openDrillDownModal={openDrillDownModal}
                    tooltipText={
                        `AI Agent referenced this content in ${ticketCount} ` +
                        (ticketCount === 1 ? 'ticket' : 'tickets')
                    }
                    enabled={ticketCount > 0}
                >
                    <Text
                        variant="bold"
                        size="xs"
                        color="content-neutral-secondary"
                    >
                        {ticketCount}
                    </Text>
                </DrillDownModalTrigger>
            </Box>
        </Box>
    )
}

const TopKnowledgeCardSkeleton = () => (
    <Card
        display="flex"
        flexDirection="row"
        padding="sm"
        gap="xs"
        alignItems="center"
        justifyContent="space-between"
    >
        <Skeleton width={190} height={18} />
        <Skeleton width={60} height={18} />
    </Card>
)
