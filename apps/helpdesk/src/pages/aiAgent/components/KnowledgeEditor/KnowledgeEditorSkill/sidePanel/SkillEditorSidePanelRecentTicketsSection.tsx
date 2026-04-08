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
import useAppDispatch from 'hooks/useAppDispatch'
import { TruncatedTextWithTooltip } from 'pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip'
import RelativeTime from 'pages/common/components/RelativeTime'

import css from './SkillEditorSidePanel.less'

type Ticket = {
    id: number
    title: string
    lastUpdatedDatetime: Date
    messageCount: number
    aiAgentOutcome: AI_AGENT_OUTCOME_DISPLAY_LABELS
}

export type Props = {
    ticketCount?: number
    latest3Tickets?: Ticket[]
    isLoading?: boolean
    resourceSourceId?: number
    resourceSourceSetId?: number
    shopIntegrationId?: number
    dateRange?: {
        start_datetime: string
        end_datetime: string
    }
    outcomeCustomFieldId?: number
    intentCustomFieldId?: number
}

export const SkillEditorSidePanelRecentTicketsSection = ({
    ticketCount,
    latest3Tickets,
    isLoading,
    resourceSourceId,
    resourceSourceSetId,
    shopIntegrationId,
    dateRange,
    outcomeCustomFieldId,
    intentCustomFieldId,
}: Props) => {
    const dispatch = useAppDispatch()

    const handleViewMoreClick = useCallback(() => {
        if (!resourceSourceId || !resourceSourceSetId || !dateRange) return

        const metricData: KnowledgeMetrics = {
            metricName: KnowledgeMetric.Tickets,
            title: 'Recent tickets',
            resourceSourceId,
            resourceSourceSetId,
            shopIntegrationId: shopIntegrationId ?? 0,
            dateRange,
            outcomeCustomFieldId,
            intentCustomFieldId,
        }

        dispatch(setMetricData(metricData))
    }, [
        dispatch,
        resourceSourceId,
        resourceSourceSetId,
        shopIntegrationId,
        dateRange,
        outcomeCustomFieldId,
        intentCustomFieldId,
    ])

    if (!isLoading && (!latest3Tickets || latest3Tickets.length === 0)) {
        return null
    }

    return (
        <Box
            display="flex"
            flexDirection="column"
            gap="md"
            paddingTop="md"
            paddingBottom="md"
        >
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
                    {ticketCount !== undefined &&
                    ticketCount > 3 &&
                    resourceSourceId &&
                    resourceSourceSetId &&
                    dateRange ? (
                        <Box>
                            <Button
                                variant="tertiary"
                                size="sm"
                                intent="regular"
                                onClick={handleViewMoreClick}
                            >
                                View more
                            </Button>
                        </Box>
                    ) : null}
                </Box>
            ) : null}
        </Box>
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
                    <Icon name="comm-mail" size={IconSize.Sm} />
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
