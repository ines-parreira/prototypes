import { Box, Card, Heading, Skeleton, Text } from '@gorgias/axiom'

import { KnowledgeMetric } from 'domains/reporting/state/ui/stats/types'
import { MetricCell } from 'pages/aiAgent/skills/components/SharedTableComponents/MetricCells'
import type { SkillMetrics } from 'pages/aiAgent/skills/types'

import css from './SkillEditorSidePanel.less'

type Props = {
    metrics?: SkillMetrics | null
    isLoading?: boolean
    resourceSourceId: number
    shopIntegrationId: number
    dateRange?: { start_datetime: string; end_datetime: string }
    totalAiAgentTickets: number
    outcomeCustomFieldId?: number
    intentCustomFieldId?: number
}

export const SkillEditorSidePanelPerformanceMetricCards = ({
    metrics,
    isLoading,
    resourceSourceId,
    shopIntegrationId,
    dateRange,
    totalAiAgentTickets,
    outcomeCustomFieldId,
    intentCustomFieldId,
}: Props) => {
    const tickets = metrics?.tickets ?? null
    const handoverTickets = metrics?.handoverTickets ?? null
    const csat = metrics?.csat ?? null
    const resourceSourceSetId = metrics?.resourceSourceSetId ?? 0

    const formattedCsat =
        csat !== null
            ? Number.isInteger(csat)
                ? csat.toString()
                : csat.toFixed(1)
            : null

    const ticketPercentageRaw =
        totalAiAgentTickets > 0 && tickets !== null
            ? (tickets / totalAiAgentTickets) * 100
            : 0
    const ticketPercentageValue = Number.isInteger(ticketPercentageRaw)
        ? ticketPercentageRaw.toString()
        : ticketPercentageRaw.toFixed(1)

    return (
        <Box display="flex" flexDirection="column" gap="xs">
            <Card className={css.performanceCard} gap="xxxs">
                <Text
                    variant="medium"
                    size="sm"
                    color="content-neutral-secondary"
                >
                    Ticket volume
                </Text>
                <Box gap="sm">
                    {isLoading ? (
                        <Skeleton width="130px" height="28px" />
                    ) : !tickets || !dateRange ? (
                        <Heading>{tickets ? String(tickets) : '--'}</Heading>
                    ) : (
                        <>
                            <MetricCell
                                type="knowledge"
                                title="Ticket volume"
                                metricName={KnowledgeMetric.Tickets}
                                value={tickets}
                                displayValue={String(tickets)}
                                resourceSourceId={resourceSourceId}
                                resourceSourceSetId={resourceSourceSetId}
                                shopIntegrationId={shopIntegrationId}
                                dateRange={dateRange}
                                outcomeCustomFieldId={outcomeCustomFieldId}
                                intentCustomFieldId={intentCustomFieldId}
                                isHeading
                            />
                            <MetricCell
                                type="knowledge"
                                title="Ticket volume"
                                metricName={KnowledgeMetric.Tickets}
                                value={tickets}
                                displayValue={`${ticketPercentageValue}%`}
                                resourceSourceId={resourceSourceId}
                                resourceSourceSetId={resourceSourceSetId}
                                shopIntegrationId={shopIntegrationId}
                                dateRange={dateRange}
                                outcomeCustomFieldId={outcomeCustomFieldId}
                                intentCustomFieldId={intentCustomFieldId}
                                showProgressBar
                                isSmall
                            />
                        </>
                    )}
                </Box>
            </Card>
            <Card className={css.performanceCard} gap="xxxs">
                <Text
                    variant="medium"
                    size="sm"
                    color="content-neutral-secondary"
                >
                    Handover tickets
                </Text>
                {isLoading ? (
                    <Skeleton width="80px" height="28px" />
                ) : !handoverTickets || !dateRange ? (
                    <Heading>
                        {handoverTickets ? String(handoverTickets) : '--'}
                    </Heading>
                ) : (
                    <MetricCell
                        type="knowledge"
                        title="Handover tickets"
                        metricName={KnowledgeMetric.HandoverTickets}
                        value={handoverTickets}
                        displayValue={String(handoverTickets)}
                        resourceSourceId={resourceSourceId}
                        resourceSourceSetId={resourceSourceSetId}
                        shopIntegrationId={shopIntegrationId}
                        dateRange={dateRange}
                        outcomeCustomFieldId={outcomeCustomFieldId}
                        intentCustomFieldId={intentCustomFieldId}
                        isHeading
                    />
                )}
            </Card>
            <Card className={css.performanceCard} gap="xxxs">
                <Text
                    variant="medium"
                    size="sm"
                    color="content-neutral-secondary"
                >
                    Average CSAT
                </Text>
                {isLoading ? (
                    <Skeleton width="80px" height="28px" />
                ) : !formattedCsat || !dateRange ? (
                    <Heading>{formattedCsat ?? '--'}</Heading>
                ) : (
                    <MetricCell
                        type="knowledge"
                        title="Average CSAT"
                        metricName={KnowledgeMetric.CSAT}
                        value={csat!}
                        displayValue={formattedCsat}
                        resourceSourceId={resourceSourceId}
                        resourceSourceSetId={resourceSourceSetId}
                        shopIntegrationId={shopIntegrationId}
                        dateRange={dateRange}
                        outcomeCustomFieldId={outcomeCustomFieldId}
                        intentCustomFieldId={intentCustomFieldId}
                        isHeading
                    />
                )}
            </Card>
        </Box>
    )
}
