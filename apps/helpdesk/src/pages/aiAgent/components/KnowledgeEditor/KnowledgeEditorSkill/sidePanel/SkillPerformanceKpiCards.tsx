import type { MetricTrendFormat, TrendDirection } from '@repo/reporting'
import { TrendBadge } from '@repo/reporting'

import { Box, Card, Heading, Skeleton, Text } from '@gorgias/axiom'

import { useSkillPerformanceDataContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceFromContext'
import { formatCsat } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

import css from './SkillPerformanceKpiCards.less'

const KPI_VALUE_PLACEHOLDER = '--'

type KpiCardProps = {
    label: string
    displayValue: string
    value: number | null
    prevValue: number | null
    metricFormat?: MetricTrendFormat
    interpretAs?: TrendDirection
    isLoading?: boolean
}

const KpiCard = ({
    label,
    displayValue,
    value,
    prevValue,
    metricFormat,
    interpretAs = 'more-is-better',
    isLoading,
}: KpiCardProps) => (
    <Card className={css.kpiCard} gap="xxxs">
        <Text variant="medium" size="sm" color="content-neutral-secondary">
            {label}
        </Text>
        {isLoading ? (
            <Skeleton width="80px" height="28px" />
        ) : (
            <Box alignItems="center" gap="xxs">
                <Heading>{displayValue}</Heading>
                <TrendBadge
                    value={value}
                    prevValue={prevValue}
                    metricFormat={metricFormat}
                    interpretAs={interpretAs}
                />
            </Box>
        )}
    </Card>
)

export const SkillPerformanceKpiCards = () => {
    const { skillMetrics } = useSkillPerformanceDataContext()
    const { metrics, isLoading } = skillMetrics

    const tickets = metrics?.tickets ?? null
    const prevTickets = metrics?.prevTickets ?? null
    const handoverTickets = metrics?.handoverTickets ?? null
    const prevHandoverTickets = metrics?.prevHandoverTickets ?? null
    const csat = metrics?.csat ?? null
    const prevCsat = metrics?.prevCsat ?? null

    const ticketsValue =
        tickets !== null ? String(tickets) : KPI_VALUE_PLACEHOLDER
    const handoverTicketsValue =
        handoverTickets !== null
            ? String(handoverTickets)
            : KPI_VALUE_PLACEHOLDER
    const csatValue = csat !== null ? formatCsat(csat) : KPI_VALUE_PLACEHOLDER

    return (
        <Box gap="xs" width="100%">
            <KpiCard
                label="Success rate"
                displayValue={KPI_VALUE_PLACEHOLDER}
                value={null}
                prevValue={null}
                metricFormat="decimal-to-percent"
            />
            <KpiCard
                label="Tickets"
                displayValue={ticketsValue}
                value={tickets}
                prevValue={prevTickets}
                metricFormat="decimal"
                isLoading={isLoading}
            />
            <KpiCard
                label="Handover tickets"
                displayValue={handoverTicketsValue}
                value={handoverTickets}
                prevValue={prevHandoverTickets}
                metricFormat="decimal"
                interpretAs="less-is-better"
                isLoading={isLoading}
            />
            <KpiCard
                label="Average CSAT"
                displayValue={csatValue}
                value={csat}
                prevValue={prevCsat}
                metricFormat="decimal-precision-1"
                isLoading={isLoading}
            />
        </Box>
    )
}
