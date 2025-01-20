import {ReactNode} from 'react'

import {MetricPerDimensionFetch} from 'hooks/reporting/distributions'
import {MetricTrendFetch} from 'hooks/reporting/useMetricTrend'
import {TimeSeriesFetch} from 'hooks/reporting/useTimeSeries'
import {StaticFilter} from 'models/stat/types'
import {OptionalFilter} from 'pages/stats/common/filters/FiltersPanel'
import {HelpCenterChart} from 'pages/stats/help-center/components/HelpCenterReport/HelpCenterReportConfig'
import {SatisfactionChart} from 'pages/stats/quality-management/satisfaction/SatisfactionReportConfig'
import {ServiceLevelAgreementsChart} from 'pages/stats/sla/ServiceLevelAgreementsReportConfig'
import {AgentsChart} from 'pages/stats/support-performance/agents/SupportPerformanceAgentsReportConfig'
import {BusiestTimesChart} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesReportConfig'
import {ChannelsChart} from 'pages/stats/support-performance/channels/ChannelsReportConfig'
import {OverviewChart} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import {TicketInsightsTagsChart} from 'pages/stats/ticket-insights/tags/TagsReportConfig'
import {TicketFieldsChart} from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldsReportConfig'
import {VoiceAgentsChart} from 'pages/stats/voice/pages/VoiceAgentsReportConfig'
import {VoiceOverviewChart} from 'pages/stats/voice/pages/VoiceOverviewReportConfig'

type FilterSettings = {
    optional: OptionalFilter[]
    persistent: StaticFilter[]
}

export enum CustomReportChildType {
    Row = 'row',
    Section = 'section',
    Chart = 'chart',
}

export enum ChartType {
    Card = 'card',
    Graph = 'graph',
    Table = 'table',
}

export type CustomReportRowSchema = {
    type: CustomReportChildType.Row
    children: CustomReportChartSchema[]
}

export type CustomReportSectionSchema = {
    type: CustomReportChildType.Section
    children: (CustomReportRowSchema | CustomReportChartSchema)[]
}

export type CustomReportChartSchema = {
    type: CustomReportChildType.Chart
    config_id: string
}

export type CustomReportChild =
    | CustomReportRowSchema
    | CustomReportSectionSchema
    | CustomReportChartSchema

export type CustomReportSchema = {
    id: number
    name: string
    analytics_filter_id: number | null | undefined
    children: CustomReportChild[]
    emoji: string | null | undefined
}

export type DashboardInput = {
    name: string
    emoji?: string | null
    analytics_filter_id?: number | null
    children?: CustomReportChild[]
}

export enum DataExportFormat {
    Trend = 'trend',
    TimeSeries = 'time-series',
    Distribution = 'distribution',
}

export type DistributionDataExportFetch = {
    type: DataExportFormat.Distribution
    fetch: {
        fetchCurrentDistribution: MetricPerDimensionFetch
        fetchPreviousDistribution: MetricPerDimensionFetch
        labelPrefix: string
    }
}

type DataExportFetch =
    | {type: DataExportFormat.Trend; fetch: MetricTrendFetch}
    | {
          type: DataExportFormat.TimeSeries
          fetch: TimeSeriesFetch
          label?: string
      }
    | DistributionDataExportFetch

export type ChartConfig = {
    chartComponent: ({chartId}: {chartId: string}) => React.JSX.Element
    label: ReactNode
    csvProducer: DataExportFetch[] | null
    description: ReactNode
    chartType: ChartType
}

export type ReportConfig<T extends string> = {
    reportName: string
    reportPath: string
    charts: Record<T, ChartConfig>
    reportFilters: FilterSettings
}

export type AvailableChartIds =
    | typeof OverviewChart
    | typeof AgentsChart
    | typeof BusiestTimesChart
    | typeof ChannelsChart
    | typeof ServiceLevelAgreementsChart
    | typeof TicketFieldsChart
    | typeof TicketInsightsTagsChart
    | typeof SatisfactionChart
    | typeof HelpCenterChart
    | typeof VoiceAgentsChart
    | typeof VoiceOverviewChart

export type ReportChildrenConfig = {
    type: AvailableChartIds
    config: ReportConfig<string>
}[]

export type ReportsModalConfig = {
    category: string
    children: ReportChildrenConfig
}[]
