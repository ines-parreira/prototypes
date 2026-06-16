import { useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import type {
    ComposedMetricTimeSeriesDataItem,
    ComposedMetricTimeSeriesMetricConfig,
} from '@repo/reporting'
import {
    ChartCard,
    ComposedMetricTimeSeriesChart,
    NoDataPlaceholder,
} from '@repo/reporting'
import {
    DateTimeFormatMapper,
    DateTimeFormatType,
    formatDatetime,
} from '@repo/utils'

import { Box, getColorValue } from '@gorgias/axiom'

import {
    SKILL_PERFORMANCE_TREND_CSAT_DATA_KEY,
    SKILL_PERFORMANCE_TREND_SUCCESS_RATE_DATA_KEY,
    SKILL_PERFORMANCE_TREND_TICKET_VOLUME_DATA_KEY,
} from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/skillPerformanceTrendDataKeys'
import { useSkillEventMarkers } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillEventMarkers'
import { useSkillPerformanceDataContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceFromContext'
import { useSkillPerformanceTrendFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceTrendFromContext'
import { formatCsat } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

const CHART_HEIGHT = 262
const CHART_LEGEND_GAP = 36
const TICKET_VOLUME_AXIS_SCALE = 2
const CSAT_AXIS_MAX = 5
const SUCCESS_RATE_AXIS_MAX = 1
const TICKET_VOLUME_COLOR = getColorValue('dataviz-coral')
const LINE_COLOR = getColorValue('dataviz-purple')
const MARKER_LEGEND_LABEL = 'Changes published in skill'
const numberFormatter = new Intl.NumberFormat()

const formatNumber = (value: number) => numberFormatter.format(value)
const formatSuccessRate = (value: number) => `${Math.round(value * 100)}%`

const formatDate = (value: string) =>
    formatDatetime(
        value,
        DateTimeFormatMapper[DateTimeFormatType.SHORT_DATE_EN_US],
    )

const barMetric: ComposedMetricTimeSeriesMetricConfig = {
    dataKey: SKILL_PERFORMANCE_TREND_TICKET_VOLUME_DATA_KEY,
    label: 'Tickets',
    color: TICKET_VOLUME_COLOR,
    valueFormatter: formatNumber,
    yAxisFormatter: formatNumber,
}

const csatLineMetric: ComposedMetricTimeSeriesMetricConfig = {
    dataKey: SKILL_PERFORMANCE_TREND_CSAT_DATA_KEY,
    label: 'CSAT',
    color: LINE_COLOR,
    valueFormatter: formatCsat,
    yAxisFormatter: formatCsat,
    yAxisDomain: [0, CSAT_AXIS_MAX],
}

const successRateLineMetric: ComposedMetricTimeSeriesMetricConfig = {
    dataKey: SKILL_PERFORMANCE_TREND_SUCCESS_RATE_DATA_KEY,
    label: 'Success rate',
    color: LINE_COLOR,
    valueFormatter: formatSuccessRate,
    yAxisFormatter: formatSuccessRate,
    yAxisDomain: [0, SUCCESS_RATE_AXIS_MAX],
}

const LINE_METRIC_OPTIONS = [csatLineMetric, successRateLineMetric]
const CHART_CARD_METRICS = LINE_METRIC_OPTIONS.map((opt) => ({
    id: opt.dataKey,
    label: opt.label,
}))

const AXIS_STEPS = [1, 2, 5, 10]

const roundAxisUpperBound = (value: number): number => {
    if (value <= 10) return Math.ceil(value)

    const magnitude = 10 ** Math.floor(Math.log10(value))
    const normalizedValue = value / magnitude
    const roundedNormalizedValue =
        AXIS_STEPS.find((step) => normalizedValue <= step) ?? 10

    return roundedNormalizedValue * magnitude
}

const buildTicketVolumeAxisDomain = (
    chartData: ComposedMetricTimeSeriesDataItem[],
): [number, number] | undefined => {
    const maxTicketVolume = chartData.reduce((max, item) => {
        const value = item[SKILL_PERFORMANCE_TREND_TICKET_VOLUME_DATA_KEY]

        return typeof value === 'number' ? Math.max(max, value) : max
    }, 0)

    if (maxTicketVolume === 0) return undefined

    return [0, roundAxisUpperBound(maxTicketVolume * TICKET_VOLUME_AXIS_SCALE)]
}

export const SkillPerformanceChart = () => {
    const isSuccessRateEnabled = useFlag(
        FeatureFlagKey.IntentBasedKnowledgeMilestone3NewReportingLayer,
    )
    const [selectedLineMetricDataKey, setSelectedLineMetricDataKey] = useState(
        SKILL_PERFORMANCE_TREND_CSAT_DATA_KEY,
    )

    const activeLineMetric =
        LINE_METRIC_OPTIONS.find(
            (opt) => opt.dataKey === selectedLineMetricDataKey,
        ) ?? csatLineMetric

    const handleMetricChange = (label: string) => {
        const opt = LINE_METRIC_OPTIONS.find((o) => o.label === label)
        if (opt) setSelectedLineMetricDataKey(opt.dataKey)
    }

    const { chartData, isLoading } = useSkillPerformanceTrendFromContext()
    const { skillMetrics } = useSkillPerformanceDataContext()
    const { markers } = useSkillEventMarkers(skillMetrics.resourceSourceId, {
        dateRange: skillMetrics.dateRange,
    })

    const chartBarMetric = useMemo<ComposedMetricTimeSeriesMetricConfig>(
        () => ({
            ...barMetric,
            yAxisDomain: buildTicketVolumeAxisDomain(chartData),
        }),
        [chartData],
    )
    const hasNoChartData = !isLoading && chartData.length === 0

    return (
        <Box>
            <ChartCard
                title={activeLineMetric.label}
                metrics={isSuccessRateEnabled ? CHART_CARD_METRICS : undefined}
                onMetricChange={
                    isSuccessRateEnabled ? handleMetricChange : undefined
                }
                withTrend={false}
                isLoading={isLoading}
            >
                {hasNoChartData ? (
                    <NoDataPlaceholder height={CHART_HEIGHT} marginBottom={0} />
                ) : (
                    <ComposedMetricTimeSeriesChart
                        data={chartData}
                        barMetric={chartBarMetric}
                        lineMetric={activeLineMetric}
                        isLoading={isLoading}
                        dateFormatter={formatDate}
                        chartHeight={CHART_HEIGHT}
                        legendGap={CHART_LEGEND_GAP}
                        markerLegendLabel={MARKER_LEGEND_LABEL}
                        markers={markers}
                    />
                )}
            </ChartCard>
        </Box>
    )
}
