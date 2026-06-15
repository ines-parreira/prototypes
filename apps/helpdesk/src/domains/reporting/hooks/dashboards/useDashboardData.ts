import { useMemo } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import type { ConfigurableGraphFetch } from 'domains/reporting/hooks/common/useConfigurableGraphsReportData'
import { useConfigurableGraphsReportData } from 'domains/reporting/hooks/common/useConfigurableGraphsReportData'
import { useDistributionTrendReportData } from 'domains/reporting/hooks/common/useDistributionTrendReportData'
import { useTables } from 'domains/reporting/hooks/common/useTableReportData'
import {
    useTimeSeriesPerDimensionReportData,
    useTimeSeriesReportData,
} from 'domains/reporting/hooks/common/useTimeSeriesReportData'
import { useTrendReportData } from 'domains/reporting/hooks/common/useTrendReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useSanitizedDashboard } from 'domains/reporting/hooks/dashboards/useSanitizedDashboard'
import type { MetricPerDimensionFetch } from 'domains/reporting/hooks/distributions'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { MetricTrendFetch } from 'domains/reporting/hooks/useMetricTrend'
import type {
    TimeSeriesFetch,
    TimeSeriesPerDimensionFetch,
} from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentReportConfig } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentReportConfig'
import { AutomateOverviewReportConfig } from 'domains/reporting/pages/automate/overview/AutomateOverviewReportConfig'
import type {
    MetricTrendFormat,
    MetricValueFormat,
} from 'domains/reporting/pages/common/utils'
import { CampaignsLegacyReportConfig } from 'domains/reporting/pages/convert/campaigns/CampaignsLegacyReportConfig'
import { CampaignsPerformanceReportConfig } from 'domains/reporting/pages/convert/campaigns/CampaignsPerformanceReportConfig'
import type {
    ChartConfig,
    DashboardChild,
    DashboardSchema,
    ReportFetch,
} from 'domains/reporting/pages/dashboards/types'
import {
    DashboardChildType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { ChannelsEmailReportConfig } from 'domains/reporting/pages/performance/channels/email/ChannelsEmailReportConfig'
import { ChannelsVoiceReportConfig } from 'domains/reporting/pages/performance/channels/voice/ChannelsVoiceReportConfig'
import { PerformanceOverviewReportConfig } from 'domains/reporting/pages/performance/overview/PerformanceOverviewReportConfig'
import { SatisfactionReportConfig } from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionReportConfig'
import { ServiceLevelAgreementsReportConfig } from 'domains/reporting/pages/sla/ServiceLevelAgreementsReportConfig'
import { VoiceServiceLevelAgreementsReportConfig } from 'domains/reporting/pages/sla/voice/VoiceServiceLevelAgreementsReportConfig'
import { SupportPerformanceAgentsReportConfig } from 'domains/reporting/pages/support-performance/agents/SupportPerformanceAgentsReportConfig'
import { AutoQAReportConfig } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAReportConfig'
import { BusiestTimesReportConfig } from 'domains/reporting/pages/support-performance/busiest-times-of-days/BusiestTimesReportConfig'
import { ChannelsReportConfig } from 'domains/reporting/pages/support-performance/channels/ChannelsReportConfig'
import { SupportPerformanceOverviewReportConfig } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { TicketInsightsTagsReportConfig } from 'domains/reporting/pages/ticket-insights/tags/TagsReportConfig'
import { TicketFieldsReportConfig } from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketInsightsFieldsReportConfig'
import { VoiceAgentsReportConfig } from 'domains/reporting/pages/voice/pages/VoiceAgentsReportConfig'
import { VoiceOverviewReportConfig } from 'domains/reporting/pages/voice/pages/VoiceOverviewReportConfig'
import { createTimeSeriesPerDimensionReport } from 'domains/reporting/services/SLAsReportingService'
import {
    createTimeSeriesReport,
    createTrendReport,
} from 'domains/reporting/services/supportPerformanceReportingService'
import { AnalyticsAiAgentAllAgentsReportConfig } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentAllAgentsReportConfig'
import { AnalyticsAiAgentShoppingAssistantReportConfig } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentShoppingAssistantReportConfig'
import { AnalyticsAiAgentSupportAgentReportConfig } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentSupportAgentReportConfig'
import { AnalyticsOverviewReportConfig } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'
import { AI_AGENT_CHART_ID_PREFIX } from 'pages/aiAgent/constants'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

const chartsLookupTable: Record<string, ChartConfig | undefined> = {
    ...SupportPerformanceOverviewReportConfig.charts,
    ...ServiceLevelAgreementsReportConfig.charts,
    ...TicketFieldsReportConfig.charts,
    ...BusiestTimesReportConfig.charts,
    ...SupportPerformanceAgentsReportConfig.charts,
    ...ChannelsReportConfig.charts,
    ...TicketInsightsTagsReportConfig.charts,
    ...AutoQAReportConfig.charts,
    ...VoiceOverviewReportConfig.charts,
    ...VoiceServiceLevelAgreementsReportConfig.charts,
    ...VoiceAgentsReportConfig.charts,
    ...SatisfactionReportConfig.charts,
    ...AutomateOverviewReportConfig.charts,
    ...CampaignsLegacyReportConfig.charts,
    ...CampaignsPerformanceReportConfig.charts,
    ...AiSalesAgentReportConfig.charts,
    ...AnalyticsOverviewReportConfig.charts,
    ...AnalyticsAiAgentAllAgentsReportConfig.charts,
    ...AnalyticsAiAgentShoppingAssistantReportConfig.charts,
    ...AnalyticsAiAgentSupportAgentReportConfig.charts,
    ...PerformanceOverviewReportConfig.charts,
    ...ChannelsEmailReportConfig.charts,
    ...ChannelsVoiceReportConfig.charts,
}

type Queries = {
    timeSeries: {
        fetchTimeSeries: TimeSeriesFetch
        title: string
        isAiAgentChart: boolean
    }[]
    timeSeriesPerDimension: {
        fetchTimeSeries: TimeSeriesPerDimensionFetch
        title: string
        headers: string[]
        dimensions: string[]
        isAiAgentChart: boolean
    }[]
    trends: {
        fetchTrend: MetricTrendFetch
        metricFormat: MetricValueFormat
        title: string
        isAiAgentChart: boolean
    }[]
    tables: {
        fetchTable: ReportFetch
        title: string
        isAiAgentChart: boolean
    }[]
    distributions:
        | {
              fetchCurrentDistribution: MetricPerDimensionFetch
              fetchPreviousDistribution: MetricPerDimensionFetch
              labelPrefix: string
              metricFormat: MetricTrendFormat
              title: string
              isAiAgentChart: boolean
          }
        | undefined
    configurableCharts: {
        fetch: ConfigurableGraphFetch
        savedMeasure: string | null | undefined
        savedDimension: string | null | undefined
        chartId: string
        isAiAgentChart: boolean
    }[]
}

const makeReduceReport =
    (chartConfigs?: Record<string, ChartConfig | undefined>) =>
    (acc: Queries, child: DashboardChild): Queries => {
        if (child.type === DashboardChildType.Chart) {
            const config = (chartConfigs ?? chartsLookupTable)[child.config_id]
            if (!config?.csvProducer) {
                return acc
            }

            const isAiAgentChart = child.config_id.startsWith(
                AI_AGENT_CHART_ID_PREFIX,
            )

            config.csvProducer.forEach((producer) => {
                if (producer.type === DataExportFormat.Trend) {
                    acc.trends.push({
                        fetchTrend: producer.fetch,
                        metricFormat: producer.metricFormat,
                        title: producer.title ?? String(config.label),
                        isAiAgentChart,
                    })
                }
                if (producer.type === DataExportFormat.TimeSeries) {
                    acc.timeSeries.push({
                        fetchTimeSeries: producer.fetch,
                        title: producer.title ?? String(config.label),
                        isAiAgentChart,
                    })
                }
                if (producer.type === DataExportFormat.TimeSeriesPerDimension) {
                    acc.timeSeriesPerDimension.push({
                        fetchTimeSeries: producer.fetch,
                        title: producer.title,
                        headers: producer.headers,
                        dimensions: producer.dimensions,
                        isAiAgentChart,
                    })
                }
                if (producer.type === DataExportFormat.Distribution) {
                    acc.distributions = {
                        ...producer.fetch,
                        metricFormat: 'decimal',
                        title: String(config.label),
                        isAiAgentChart,
                    }
                }
                if (producer.type === DataExportFormat.Table) {
                    acc.tables.push({
                        fetchTable: producer.fetch,
                        title: String(config.label),
                        isAiAgentChart,
                    })
                }
                if (
                    producer.type === DataExportFormat.ConfigurableBarGraph ||
                    producer.type === DataExportFormat.ConfigurableLineGraph ||
                    producer.type === DataExportFormat.ConfigurableTable
                ) {
                    acc.configurableCharts.push({
                        fetch: producer.fetch,
                        savedMeasure:
                            child.metadata?.preferences?.measures?.[0],
                        savedDimension:
                            child.metadata?.preferences?.dimensions?.[0],
                        chartId: child.config_id,
                        isAiAgentChart,
                    })
                }
            })
        }
        if (
            child.type === DashboardChildType.Section ||
            child.type === DashboardChildType.Row
        ) {
            return child.children.reduce(makeReduceReport(chartConfigs), acc)
        }
        return acc
    }

const getQueryGroupsFromDashboard = (
    dashboard: DashboardSchema,
    chartConfigs?: Record<string, ChartConfig | undefined>,
): Queries => {
    return dashboard.children.reduce<Queries>(makeReduceReport(chartConfigs), {
        timeSeries: [],
        timeSeriesPerDimension: [],
        trends: [],
        distributions: undefined,
        tables: [],
        configurableCharts: [],
    })
}

const TRENDS_FILE_SUFFIX = 'trends'
const TIME_SERIES_FILE_SUFFIX = 'timeSeries'
const DISTRIBUTIONS_FILE_SUFFIX = 'distributions'

export const useDashboardData = (
    dashboard: DashboardSchema,
    chartConfigs?: Record<string, ChartConfig | undefined>,
) => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()
    const { statsFilters: aiAgentFilters } = useAiAgentStatsFilters()
    const { value: isInstagramDmsEnabled } = useFlagWithLoading(
        FeatureFlagKey.AiAgentInstagramDms,
    )
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )
    const extra = useMemo(
        () => ({
            costSavedPerInteraction,
            isInstagramDmsEnabled: Number(isInstagramDmsEnabled),
        }),
        [costSavedPerInteraction, isInstagramDmsEnabled],
    )

    const sanitizedDashboard = useSanitizedDashboard(dashboard)

    const queryGroups = useMemo(
        () => getQueryGroupsFromDashboard(sanitizedDashboard, chartConfigs),
        [sanitizedDashboard, chartConfigs],
    )

    const trends = useTrendReportData(
        cleanStatsFilters,
        userTimezone,
        queryGroups.trends,
        aiAgentFilters,
    )
    const trendsReport = createTrendReport(
        trends.data,
        `${getCsvFileNameWithDates(cleanStatsFilters.period, `${dashboard.name} - ${TRENDS_FILE_SUFFIX}`)}`,
    )
    const timeSeries = useTimeSeriesReportData(
        cleanStatsFilters,
        userTimezone,
        granularity,
        queryGroups.timeSeries,
        aiAgentFilters,
    )
    const timeSeriesReport = createTimeSeriesReport(
        timeSeries.data,
        `${getCsvFileNameWithDates(cleanStatsFilters.period, `${dashboard.name} - ${TIME_SERIES_FILE_SUFFIX}`)}`,
    )

    const timeSeriesPerDimension = useTimeSeriesPerDimensionReportData(
        cleanStatsFilters,
        userTimezone,
        granularity,
        queryGroups.timeSeriesPerDimension,
        aiAgentFilters,
    )
    const timeSeriesPerDimensionReports = createTimeSeriesPerDimensionReport(
        timeSeriesPerDimension.data,
        cleanStatsFilters.period,
    )

    const distributions = useDistributionTrendReportData(
        cleanStatsFilters,
        userTimezone,
        queryGroups.distributions,
        aiAgentFilters,
    )
    const distributionsReport = createTrendReport(
        distributions.data,
        `${getCsvFileNameWithDates(cleanStatsFilters.period, `${queryGroups.distributions?.title} - ${DISTRIBUTIONS_FILE_SUFFIX}`)}`,
    )
    const tables = useTables(
        cleanStatsFilters,
        userTimezone,
        granularity,
        queryGroups.tables,
        aiAgentFilters,
    )
    const configurableGraphs = useConfigurableGraphsReportData(
        cleanStatsFilters,
        userTimezone,
        granularity,
        queryGroups.configurableCharts,
        aiAgentFilters,
        extra,
    )

    const loading = useMemo(() => {
        return [
            trends,
            timeSeries,
            distributions,
            timeSeriesPerDimension,
            tables,
            configurableGraphs,
        ].some((metric) => metric.isFetching)
    }, [
        distributions,
        tables,
        timeSeries,
        timeSeriesPerDimension,
        trends,
        configurableGraphs,
    ])

    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        dashboard.name,
    )

    const files = useMemo(
        () => ({
            ...trendsReport.files,
            ...timeSeriesReport.files,
            ...timeSeriesPerDimensionReports.files,
            ...distributionsReport.files,
            ...tables.files,
            ...configurableGraphs.files,
        }),
        [
            distributionsReport.files,
            timeSeriesPerDimensionReports.files,
            timeSeriesReport.files,
            trendsReport.files,
            tables.files,
            configurableGraphs.files,
        ],
    )

    return { files, fileName, isLoading: loading }
}
