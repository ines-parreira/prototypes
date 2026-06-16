import { useCallback, useMemo } from 'react'

import moment from 'moment'

import { TrendCard } from '@repo/reporting'
import type { MetricTrend, MetricTrendFormat } from '@repo/reporting'
import { DateTimeFormatMapper, DateTimeFormatType } from '@repo/utils'
import { useSkillReportingEnabled } from 'pages/aiAgent/skills/hooks/useSkillReportingEnabled'

import { Box } from '@gorgias/axiom'

import { KnowledgeMetric } from 'domains/reporting/state/ui/stats/types'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'
import { useKnowledgeDrillDownTrigger } from 'pages/aiAgent/skills/hooks/useKnowledgeDrillDownTrigger'
import { useSkillSuccessRateMetric } from 'pages/aiAgent/skills/hooks/useSkillSuccessRateMetric'
import type { SkillMetrics } from 'pages/aiAgent/skills/types'

import type { DateRange } from '../../shared/types'

const CHART_DATE_FORMAT = DateTimeFormatMapper[
    DateTimeFormatType.SHORT_DATE_EN_US
] as string

type Props = {
    metrics?: SkillMetrics | null
    isLoading?: boolean
    resourceSourceId: number
    resourceSourceSetId: number
    shopIntegrationId: number
    dateRange?: DateRange
    totalAiAgentTickets: number
    outcomeCustomFieldId?: number
    intentCustomFieldId?: number
}

const SUCCESS_RATE_HINT = {
    title: 'Success rate',
    caption:
        'Automated interactions by AI Agent as a percent of all AI Agent interactions.',
}

const toTrend = (
    label: string,
    value: number | null,
    prevValue: number | null,
    isLoading?: boolean,
): MetricTrend => ({
    isFetching: !!isLoading,
    isError: false,
    data: {
        label,
        value: isLoading ? value : (value ?? 0),
        prevValue,
    },
})

type KnowledgeTrendCardProps = {
    label: string
    value: number | null
    prevValue: number | null
    metricFormat: MetricTrendFormat
    metricName: KnowledgeMetric
    isLoading?: boolean
    resourceSourceId: number
    resourceSourceSetId: number
    shopIntegrationId: number
    dateRange: DateRange
    outcomeCustomFieldId?: number
    intentCustomFieldId?: number
}

const KnowledgeTrendCard = ({
    label,
    value,
    prevValue,
    metricFormat,
    metricName,
    isLoading,
    resourceSourceId,
    resourceSourceSetId,
    shopIntegrationId,
    dateRange,
    outcomeCustomFieldId,
    intentCustomFieldId,
}: KnowledgeTrendCardProps) => {
    const { openDrillDownModal, tooltipText } = useKnowledgeDrillDownTrigger({
        metricName,
        title: label,
        resourceSourceId,
        resourceSourceSetId,
        shopIntegrationId,
        dateRange,
        outcomeCustomFieldId,
        intentCustomFieldId,
    })

    const trend = useMemo(
        () => toTrend(label, value, prevValue, isLoading),
        [label, value, prevValue, isLoading],
    )

    return (
        <TrendCard
            trend={trend}
            metricFormat={metricFormat}
            interpretAs="more-is-better"
            withBorder
            withFixedWidth={false}
            compact
            trendBadgeTooltipData={{
                period: formatPreviousPeriod(dateRange),
            }}
            drillDown={{ tooltipText, openDrillDownModal }}
        />
    )
}

type PlainTrendCardProps = {
    label: string
    value: number | null
    prevValue: number | null
    metricFormat: MetricTrendFormat
    isLoading?: boolean
}

const PlainTrendCard = ({
    label,
    value,
    prevValue,
    metricFormat,
    isLoading,
}: PlainTrendCardProps) => {
    const trend = useMemo(
        () => toTrend(label, value, prevValue, isLoading),
        [label, value, prevValue, isLoading],
    )

    return (
        <TrendCard
            trend={trend}
            metricFormat={metricFormat}
            interpretAs="more-is-better"
            withBorder
            withFixedWidth={false}
            compact
        />
    )
}

type SuccessRateCardProps = {
    skillId: number
    resourceSourceSetId: number
    shopIntegrationId: number
    dateRange?: DateRange
}

const SuccessRateCard = ({
    skillId,
    resourceSourceSetId,
    shopIntegrationId,
    dateRange,
}: SuccessRateCardProps) => {
    const { value, prevValue, sparklineData, isLoading } =
        useSkillSuccessRateMetric({
            skillId,
            resourceSourceSetId,
            shopIntegrationId,
            dateRange,
        })

    const trend = useMemo(
        () => toTrend('Success rate', value, prevValue, isLoading),
        [value, prevValue, isLoading],
    )

    const chartData = useMemo(
        () =>
            sparklineData.map((point) => ({
                date: point.date,
                value: point.value,
            })),
        [sparklineData],
    )

    const getChartData = useCallback(
        () => ({ data: chartData, isLoading }),
        [chartData, isLoading],
    )

    return (
        <TrendCard
            trend={trend}
            metricFormat="decimal-to-percent"
            interpretAs="more-is-better"
            hint={SUCCESS_RATE_HINT}
            withBorder
            withFixedWidth={false}
            compact
            trendBadgeTooltipData={{
                period: formatPreviousPeriod(dateRange),
            }}
            timeSeriesView={{
                useChartData: getChartData,
                valueFormatter: (v) => `${Math.round(v * 100)}%`,
                dateFormatter: (d) => moment(d).format(CHART_DATE_FORMAT),
            }}
        />
    )
}

export const SkillEditorSidePanelPerformanceMetricCards = ({
    metrics,
    isLoading,
    resourceSourceId,
    resourceSourceSetId,
    shopIntegrationId,
    dateRange,
    outcomeCustomFieldId,
    intentCustomFieldId,
}: Props) => {
    const isSuccessRateEnabled = useSkillReportingEnabled()

    // Drilldown requires a date range; without it, fall back to plain cards.
    const renderMetricCard = (
        label: string,
        value: number | null,
        prevValue: number | null,
        metricFormat: MetricTrendFormat,
        metricName: KnowledgeMetric,
    ) => {
        if (!dateRange) {
            return (
                <PlainTrendCard
                    label={label}
                    value={value}
                    prevValue={prevValue}
                    metricFormat={metricFormat}
                    isLoading={isLoading}
                />
            )
        }

        return (
            <KnowledgeTrendCard
                label={label}
                value={value}
                prevValue={prevValue}
                metricFormat={metricFormat}
                metricName={metricName}
                isLoading={isLoading}
                resourceSourceId={resourceSourceId}
                resourceSourceSetId={resourceSourceSetId}
                shopIntegrationId={shopIntegrationId}
                dateRange={dateRange}
                outcomeCustomFieldId={outcomeCustomFieldId}
                intentCustomFieldId={intentCustomFieldId}
            />
        )
    }

    return (
        <Box display="flex" flexDirection="column" gap="xs" width="100%">
            {isSuccessRateEnabled && (
                <SuccessRateCard
                    skillId={resourceSourceId}
                    resourceSourceSetId={resourceSourceSetId}
                    shopIntegrationId={shopIntegrationId}
                    dateRange={dateRange}
                />
            )}
            {renderMetricCard(
                'Tickets',
                metrics?.tickets ?? null,
                metrics?.prevTickets ?? null,
                'decimal',
                KnowledgeMetric.Tickets,
            )}
            {renderMetricCard(
                'Handovers',
                metrics?.handoverTickets ?? null,
                metrics?.prevHandoverTickets ?? null,
                'decimal',
                KnowledgeMetric.HandoverTickets,
            )}
            {renderMetricCard(
                'CSAT',
                metrics?.csat ?? null,
                metrics?.prevCsat ?? null,
                'decimal-precision-1',
                KnowledgeMetric.CSAT,
            )}
        </Box>
    )
}
