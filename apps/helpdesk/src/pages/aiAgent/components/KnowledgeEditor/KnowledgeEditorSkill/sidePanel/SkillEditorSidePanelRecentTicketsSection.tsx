import { useCallback } from 'react'

import {
    Box,
    Button,
    Card,
    Icon,
    IconSize,
    Quantity,
    Skeleton,
    Tag,
    TagColor,
    Text,
} from '@gorgias/axiom'

import { AI_AGENT_OUTCOME_DISPLAY_LABELS } from 'domains/reporting/hooks/automate/types'
import { setMetricData } from 'domains/reporting/state/ui/stats/drillDownSlice'
import type { KnowledgeMetrics } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { KnowledgeMetric } from 'domains/reporting/state/ui/stats/types'
import { useAppDispatch } from 'hooks/useAppDispatch'
import { KnowledgeEditorSidePanelSection } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSection'
import { useSkillPerformanceFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceFromContext'
import { TruncatedTextWithTooltip } from 'pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip'
import { RelativeTime } from 'pages/common/components/RelativeTime'

import css from './SkillEditorSidePanelRecentTicketsSection.less'

type Ticket = {
    id: number
    title: string
    lastUpdatedDatetime: Date
    messageCount: number
    aiAgentOutcome: AI_AGENT_OUTCOME_DISPLAY_LABELS
}

export type Props = {
    sectionId: string
}

export const SkillEditorSidePanelRecentTicketsSection = ({
    sectionId,
}: Props) => {
    const { recentTickets, isPreview } = useSkillPerformanceFromContext()
    const dispatch = useAppDispatch()

    const handleViewMoreClick = useCallback(() => {
        if (
            !recentTickets?.resourceSourceId ||
            !recentTickets?.resourceSourceSetId ||
            !recentTickets?.dateRange
        )
            return

        const metricData: KnowledgeMetrics = {
            metricName: KnowledgeMetric.Tickets,
            title: 'Recent tickets',
            resourceSourceId: recentTickets.resourceSourceId,
            resourceSourceSetId: recentTickets.resourceSourceSetId,
            shopIntegrationId: recentTickets.shopIntegrationId ?? 0,
            dateRange: recentTickets.dateRange,
            outcomeCustomFieldId: recentTickets.outcomeCustomFieldId,
            intentCustomFieldId: recentTickets.intentCustomFieldId,
        }

        dispatch(setMetricData(metricData))
    }, [dispatch, recentTickets])

    if (!recentTickets) {
        return null
    }

    const {
        ticketCount,
        latest3Tickets,
        isLoading,
        resourceSourceId,
        resourceSourceSetId,
        dateRange,
    } = recentTickets

    if (!isLoading && (!latest3Tickets || latest3Tickets.length === 0)) {
        return null
    }

    const header = (
        <Box gap="xxs" alignItems="center">
            <Text size="md" variant="bold">
                Recent tickets
            </Text>
            {isLoading ? (
                <Skeleton width={22} height={18} />
            ) : (
                <Quantity quantity={ticketCount ?? 0} />
            )}
        </Box>
    )

    return (
        <KnowledgeEditorSidePanelSection
            header={{ title: header }}
            sectionId={sectionId}
            alwaysExpanded={!isPreview}
            withBorderBottom={false}
            bottomElement={
                ticketCount !== undefined &&
                ticketCount > 3 &&
                resourceSourceId &&
                resourceSourceSetId &&
                dateRange ? (
                    <Button
                        variant="tertiary"
                        size="sm"
                        intent="regular"
                        onClick={handleViewMoreClick}
                    >
                        View more
                    </Button>
                ) : undefined
            }
        >
            {isLoading ? (
                <Box display="flex" flexDirection="column" gap="xs">
                    {[1, 2, 3].map((index) => (
                        <TicketCardSkeleton key={index} />
                    ))}
                </Box>
            ) : latest3Tickets && latest3Tickets.length > 0 ? (
                <Box display="flex" flexDirection="column" gap="xs">
                    <Box display="flex" flexDirection="column" gap="xs">
                        {latest3Tickets.map((ticket, index) => (
                            <TicketCard key={index} ticket={ticket} />
                        ))}
                    </Box>
                </Box>
            ) : null}
        </KnowledgeEditorSidePanelSection>
    )
}

const TicketCard = ({ ticket }: { ticket: Ticket }) => (
    <Box
        display="flex"
        flexDirection="column"
        padding="sm"
        gap="xxs"
        className={css.ticketCard}
        onClick={() => {
            window.open(
                `/app/ticket/${ticket.id}`,
                '_blank',
                'noopener,noreferrer',
            )
        }}
    >
        <Box alignItems="center" justifyContent="space-between">
            <Box alignItems="center" gap="xxxs" className={css.ticketTitle}>
                <Box color="content-neutral-secondary">
                    <Icon name="mail" size={IconSize.Sm} />
                </Box>
                <TruncatedTextWithTooltip tooltipContent={ticket.title}>
                    <Text variant="bold" size="sm">
                        {ticket.title}
                    </Text>
                </TruncatedTextWithTooltip>
            </Box>
            <Text size="sm" color="content-neutral-secondary">
                <RelativeTime
                    datetime={ticket.lastUpdatedDatetime.toISOString()}
                />
            </Text>
        </Box>
        <Box alignItems="center" gap="xs">
            <Box>
                {ticket.aiAgentOutcome ===
                AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover ? (
                    <Tag color={TagColor.Orange}>
                        {AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover}
                    </Tag>
                ) : (
                    <Tag color={TagColor.Green}>
                        {AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated}
                    </Tag>
                )}
            </Box>
            <Text size="sm" color="content-neutral-secondary">
                {ticket.messageCount}
                {ticket.messageCount > 1 ? ' messages' : ' message'}
            </Text>
        </Box>
    </Box>
)

const TicketCardSkeleton = () => (
    <Card padding="sm" gap="xxs">
        <Box alignItems="center" justifyContent="space-between">
            <Skeleton width={150} height={16} />
            <Skeleton width={60} height={16} />
        </Box>
        <Box alignItems="center" gap="xs">
            <Skeleton width={80} height={24} />
            <Skeleton width={70} height={16} />
        </Box>
    </Card>
)
