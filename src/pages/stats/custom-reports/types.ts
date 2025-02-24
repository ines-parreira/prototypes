import {Tag} from '@gorgias/api-queries'

import {ReactNode} from 'react'

import {User} from 'config/types/user'
import {MetricPerDimensionFetch} from 'hooks/reporting/distributions'
import {MetricTrendFetch} from 'hooks/reporting/useMetricTrend'
import {
    TimeSeriesFetch,
    TimeSeriesPerDimensionFetch,
} from 'hooks/reporting/useTimeSeries'
import {Channel} from 'models/channel/types'
import {Integration} from 'models/integration/types'
import {ReportingGranularity} from 'models/reporting/types'
import {StaticFilter, StatsFilters} from 'models/stat/types'
import {AutomateOverviewChart} from 'pages/stats/automate/overview/AutomateOverviewReportConfig'
import {OptionalFilter} from 'pages/stats/common/filters/FiltersPanel'
import {MetricValueFormat} from 'pages/stats/common/utils'
import {CampaignsLegacyChart} from 'pages/stats/convert/campaigns/CampaignsLegacyReportConfig'
import {CampaignsChart} from 'pages/stats/convert/campaigns/CampaignsPerformanceReportConfig'
import {ReportsIDs} from 'pages/stats/custom-reports/constants'
import {HelpCenterChart} from 'pages/stats/help-center/components/HelpCenterReport/HelpCenterReportConfig'
import {SatisfactionChart} from 'pages/stats/quality-management/satisfaction/SatisfactionReportConfig'
import {ServiceLevelAgreementsChart} from 'pages/stats/sla/ServiceLevelAgreementsReportConfig'
import {AgentsChart} from 'pages/stats/support-performance/agents/SupportPerformanceAgentsReportConfig'
import {AutoQAChart} from 'pages/stats/support-performance/auto-qa/AutoQAReportConfig'
import {BusiestTimesChart} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesReportConfig'
import {BusiestTimeOfDaysMetrics} from 'pages/stats/support-performance/busiest-times-of-days/types'
import {ChannelsChart} from 'pages/stats/support-performance/channels/ChannelsReportConfig'
import {OverviewChart} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import {TicketInsightsTagsChart} from 'pages/stats/ticket-insights/tags/TagsReportConfig'
import {TicketFieldsChart} from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldsReportConfig'
import {VoiceAgentsChart} from 'pages/stats/voice/pages/VoiceAgentsReportConfig'
import {VoiceOverviewChart} from 'pages/stats/voice/pages/VoiceOverviewReportConfig'
import {TagsTableOrder} from 'state/ui/stats/tagsReportSlice'
import {TicketInsightsOrder} from 'state/ui/stats/ticketInsightsSlice'
import {AgentsTableColumn, ChannelsTableColumns} from 'state/ui/stats/types'

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
    analytics_filter_id?: number | null
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
    TimeSeriesPerDimension = 'time-series-per-dimension',
    Distribution = 'distribution',
    Table = 'table',
}

export type DistributionDataExportFetch = {
    type: DataExportFormat.Distribution
    fetch: {
        fetchCurrentDistribution: MetricPerDimensionFetch
        fetchPreviousDistribution: MetricPerDimensionFetch
        labelPrefix: string
    }
}

export type ReportFetch = (
    statsFilters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    context: {
        agents: User[]
        agentsQA: User[]
        columnsOrder: AgentsTableColumn[]
        channels: Channel[]
        channelColumnsOrder: ChannelsTableColumns[]
        selectedBTODMetric: BusiestTimeOfDaysMetrics
        customFieldsOrder: TicketInsightsOrder
        selectedCustomFieldId: string | null
        tags: Record<string, Tag | undefined>
        tagsTableOrder: TagsTableOrder
        integrations: Integration[]
        getAgentDetails: (id: number) => User | undefined
        isAutomateNonFilteredDenominatorInAutomationRate: boolean | undefined
        aiAgentUserId: string | undefined
    }
) => Promise<{
    isLoading: boolean
    fileName: string
    files: Record<string, string>
}>

export type DataExportFetch =
    | {
          type: DataExportFormat.Trend
          fetch: MetricTrendFetch
          metricFormat: MetricValueFormat
          title?: string
      }
    | {type: DataExportFormat.Table; fetch: ReportFetch}
    | {
          type: DataExportFormat.TimeSeries
          fetch: TimeSeriesFetch
          title?: string
      }
    | DistributionDataExportFetch
    | {
          type: DataExportFormat.TimeSeriesPerDimension
          fetch: TimeSeriesPerDimensionFetch
          title: string
          headers: string[]
          dimensions: string[]
      }

export interface DashboardChartProps {
    chartId?: string
    dashboard?: CustomReportSchema
}

export type ChartConfig = {
    chartComponent: (props: DashboardChartProps) => React.JSX.Element
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
    | typeof AgentsChart
    | typeof AutomateOverviewChart
    | typeof AutoQAChart
    | typeof BusiestTimesChart
    | typeof ChannelsChart
    | typeof HelpCenterChart
    | typeof OverviewChart
    | typeof SatisfactionChart
    | typeof ServiceLevelAgreementsChart
    | typeof TicketFieldsChart
    | typeof TicketInsightsTagsChart
    | typeof VoiceAgentsChart
    | typeof VoiceOverviewChart
    | typeof CampaignsChart
    | typeof CampaignsLegacyChart

export type ReportChildrenConfig = {
    type: AvailableChartIds
    config: ReportConfig<string>
    id: ReportsIDs
}[]

export type ReportsModalConfig = {
    category: string
    children: ReportChildrenConfig
}[]
