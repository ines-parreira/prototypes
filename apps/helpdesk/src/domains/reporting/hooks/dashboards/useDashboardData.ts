import { useMemo } from 'react'

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
}

type Queries = {
    timeSeries: {
        fetchTimeSeries: TimeSeriesFetch

        title: string
    }[]
    timeSeriesPerDimension: {
        fetchTimeSeries: TimeSeriesPerDimensionFetch
        title: string
        headers: string[]
        dimensions: string[]
    }[]
    trends: {
        fetchTrend: MetricTrendFetch
        metricFormat: MetricValueFormat
        title: string
    }[]
    tables: { fetchTable: ReportFetch; title: string }[]
    distributions:
        | {
              fetchCurrentDistribution: MetricPerDimensionFetch
              fetchPreviousDistribution: MetricPerDimensionFetch
              labelPrefix: string
              metricFormat: MetricTrendFormat
              title: string
          }
        | undefined
    configurableCharts: {
        fetch: ConfigurableGraphFetch
        savedMeasure: string | null | undefined
        savedDimension: string | null | undefined
        chartId: string
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

            config.csvProducer.forEach((producer) => {
                if (producer.type === DataExportFormat.Trend) {
                    acc.trends.push({
                        fetchTrend: producer.fetch,
                        metricFormat: producer.metricFormat,
                        title: producer.title ?? String(config.label),
                    })
                }
                if (producer.type === DataExportFormat.TimeSeries) {
                    acc.timeSeries.push({
                        fetchTimeSeries: producer.fetch,
                        title: producer.title ?? String(config.label),
                    })
                }
                if (producer.type === DataExportFormat.TimeSeriesPerDimension) {
                    acc.timeSeriesPerDimension.push({
                        fetchTimeSeries: producer.fetch,
                        title: producer.title,
                        headers: producer.headers,
                        dimensions: producer.dimensions,
                    })
                }
                if (producer.type === DataExportFormat.Distribution) {
                    acc.distributions = {
                        ...producer.fetch,
                        metricFormat: 'decimal',
                        title: String(config.label),
                    }
                }
                if (producer.type === DataExportFormat.Table) {
                    acc.tables.push({
                        fetchTable: producer.fetch,
                        title: String(config.label),
                    })
                }
                if (
                    producer.type === DataExportFormat.ConfigurableBarGraph ||
                    producer.type === DataExportFormat.ConfigurableLineGraph
                ) {
                    acc.configurableCharts.push({
                        fetch: producer.fetch,
                        savedMeasure: child.metadata?.savedMeasure,
                        savedDimension: child.metadata?.savedDimension,
                        chartId: child.config_id,
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
    isAiAgentDashboard?: boolean,
    chartConfigs?: Record<string, ChartConfig | undefined>,
) => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const statsFilters = useMemo(
        () =>
            isAiAgentDashboard
                ? { period: cleanStatsFilters.period }
                : cleanStatsFilters,
        [isAiAgentDashboard, cleanStatsFilters],
    )

    const sanitizedDashboard = useSanitizedDashboard(dashboard)

    const queryGroups = useMemo(
        () => getQueryGroupsFromDashboard(sanitizedDashboard, chartConfigs),
        [sanitizedDashboard, chartConfigs],
    )

    const trends = useTrendReportData(
        statsFilters,
        userTimezone,
        queryGroups.trends,
    )
    const trendsReport = createTrendReport(
        trends.data,
        `${getCsvFileNameWithDates(statsFilters.period, `${dashboard.name} - ${TRENDS_FILE_SUFFIX}`)}`,
    )
    const timeSeries = useTimeSeriesReportData(
        statsFilters,
        userTimezone,
        granularity,
        queryGroups.timeSeries,
    )
    const timeSeriesReport = createTimeSeriesReport(
        timeSeries.data,
        `${getCsvFileNameWithDates(statsFilters.period, `${dashboard.name} - ${TIME_SERIES_FILE_SUFFIX}`)}`,
    )

    const timeSeriesPerDimension = useTimeSeriesPerDimensionReportData(
        statsFilters,
        userTimezone,
        granularity,
        queryGroups.timeSeriesPerDimension,
    )
    const timeSeriesPerDimensionReports = createTimeSeriesPerDimensionReport(
        timeSeriesPerDimension.data,
        statsFilters.period,
    )

    const distributions = useDistributionTrendReportData(
        statsFilters,
        userTimezone,
        queryGroups.distributions,
    )
    const distributionsReport = createTrendReport(
        distributions.data,
        `${getCsvFileNameWithDates(statsFilters.period, `${queryGroups.distributions?.title} - ${DISTRIBUTIONS_FILE_SUFFIX}`)}`,
    )
    const tables = useTables(
        statsFilters,
        userTimezone,
        granularity,
        queryGroups.tables,
    )
    const configurableGraphs = useConfigurableGraphsReportData(
        statsFilters,
        userTimezone,
        granularity,
        queryGroups.configurableCharts,
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
        statsFilters.period,
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
