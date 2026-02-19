import type { MetricTrendFormat, TrendDirection } from '@repo/reporting'

import type { Tag } from '@gorgias/helpdesk-queries'

import type { User } from 'config/types/user'
import type { MetricPerDimensionFetch } from 'domains/reporting/hooks/distributions'
import type { TagSelection } from 'domains/reporting/hooks/tags/useTagResultsSelection'
import type { MetricTrendFetch } from 'domains/reporting/hooks/useMetricTrend'
import type {
    TimeSeriesFetch,
    TimeSeriesPerDimensionFetch,
} from 'domains/reporting/hooks/useTimeSeries'
import type {
    AggregationWindow,
    StaticFilter,
    StatsFilters,
    TicketTimeReference,
} from 'domains/reporting/models/stat/types'
import type { AutomateAiAgentsChart } from 'domains/reporting/pages/automate/ai-agent/AutomateAiAgentsReportConfig'
import type { AiSalesAgentChart } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import type { AutomateOverviewChart } from 'domains/reporting/pages/automate/overview/AutomateOverviewReportConfig'
import type { OptionalFilter } from 'domains/reporting/pages/common/filters/FiltersPanel'
import type { MetricValueFormat } from 'domains/reporting/pages/common/utils'
import type { CampaignsLegacyChart } from 'domains/reporting/pages/convert/campaigns/CampaignsLegacyReportConfig'
import type { CampaignsChart } from 'domains/reporting/pages/convert/campaigns/CampaignsPerformanceReportConfig'
import type { CampaignReportContext } from 'domains/reporting/pages/convert/components/DownloadOverviewData/GenerateReportService'
import type { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { HelpCenterChart } from 'domains/reporting/pages/help-center/components/HelpCenterReport/HelpCenterReportConfig'
import type { SatisfactionChart } from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionReportConfig'
import type { ServiceLevelAgreementsChart } from 'domains/reporting/pages/sla/ServiceLevelAgreementsReportConfig'
import type { VoiceServiceLevelAgreementsChart } from 'domains/reporting/pages/sla/voice/VoiceServiceLevelAgreementsReportConfig'
import type { AgentsChart } from 'domains/reporting/pages/support-performance/agents/SupportPerformanceAgentsReportConfig'
import type { AutoQAChart } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAReportConfig'
import type { BusiestTimesChart } from 'domains/reporting/pages/support-performance/busiest-times-of-days/BusiestTimesReportConfig'
import type { BusiestTimeOfDaysMetrics } from 'domains/reporting/pages/support-performance/busiest-times-of-days/types'
import type { ChannelsChart } from 'domains/reporting/pages/support-performance/channels/ChannelsReportConfig'
import type { OverviewChart } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReportConfig'
import type { TicketInsightsTagsChart } from 'domains/reporting/pages/ticket-insights/tags/TagsReportConfig'
import type { TicketFieldsChart } from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketInsightsFieldsReportConfig'
import type { VoiceAgentsChart } from 'domains/reporting/pages/voice/pages/VoiceAgentsReportConfig'
import type { VoiceOverviewChart } from 'domains/reporting/pages/voice/pages/VoiceOverviewReportConfig'
import type { TagsTableOrder } from 'domains/reporting/state/ui/stats/tagsReportSlice'
import type { TicketInsightsOrder } from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import type {
    AgentsTableColumn,
    AgentsTableRow,
    ChannelsTableColumns,
} from 'domains/reporting/state/ui/stats/types'
import type { Channel } from 'models/channel/types'
import type { Integration } from 'models/integration/types'
import type { AnalyticsOverviewChart } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'

type FilterSettings = {
    optional: OptionalFilter[]
    persistent: StaticFilter[]
}

export enum DashboardChildType {
    Row = 'row',
    Section = 'section',
    Chart = 'chart',
}

export enum ChartType {
    Card = 'card',
    Graph = 'graph',
    Table = 'table',
}

export type DashboardRowSchema = {
    type: DashboardChildType.Row
    children: DashboardChartSchema[]
}

export type DashboardSectionSchema = {
    type: DashboardChildType.Section
    children: (DashboardRowSchema | DashboardChartSchema)[]
}

export type ChartLayoutMetadata = {
    x: number
    y: number
    w: number
    h: number
}

export type DashboardChartSchema = {
    type: DashboardChildType.Chart
    config_id: string
    metadata?: {
        layout?: ChartLayoutMetadata
    }
}

export type DashboardChild =
    | DashboardRowSchema
    | DashboardSectionSchema
    | DashboardChartSchema

export type DashboardSchema = {
    id: number
    name: string
    analytics_filter_id: number | null
    children: DashboardChild[]
    emoji: string | null
}

export type DashboardInput = {
    name: string
    emoji?: string | null
    analytics_filter_id?: number | null
    children?: DashboardChild[]
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
    granularity: AggregationWindow,
    context: {
        agents: User[]
        agentsQA: User[]
        columnsOrder: AgentsTableColumn[]
        rowsOrder: AgentsTableRow[]
        channels: Channel[]
        channelColumnsOrder: ChannelsTableColumns[]
        selectedBTODMetric: BusiestTimeOfDaysMetrics
        customFieldsOrder: TicketInsightsOrder
        selectedCustomFieldId: number | null
        tags: Record<string, Tag | undefined>
        tagsTableOrder: TagsTableOrder
        isExtendedReportingEnabled: boolean
        tagTicketTimeReference: TicketTimeReference
        ticketFieldsTicketTimeReference: TicketTimeReference
        integrations: Integration[]
        getAgentDetails: (id: number) => User | undefined
        aiAgentUserId: number | undefined
        campaignsReportContext: CampaignReportContext
        tagResultsSelection: TagSelection
    },
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
    | { type: DataExportFormat.Table; fetch: ReportFetch }
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
    dashboard?: DashboardSchema
    chartConfig?: ChartConfig
    additionalProps?: any
}

export type ChartConfig = {
    chartComponent: (props: DashboardChartProps) => React.JSX.Element
    label: string
    csvProducer: DataExportFetch[] | null
    description: string
    chartType: ChartType
    metricFormat?: MetricTrendFormat
    interpretAs?: TrendDirection
}

export type ReportConfig<T extends string> = {
    id: ReportsIDs
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
    | typeof VoiceServiceLevelAgreementsChart
    | typeof TicketFieldsChart
    | typeof TicketInsightsTagsChart
    | typeof VoiceAgentsChart
    | typeof VoiceOverviewChart
    | typeof CampaignsChart
    | typeof CampaignsLegacyChart
    | typeof AiSalesAgentChart
    | typeof AutomateAiAgentsChart
    | typeof AnalyticsOverviewChart

export type ReportChildrenConfig = {
    type: AvailableChartIds
    config: ReportConfig<string>
}[]

export type ReportsModalConfig = {
    category: string
    children: ReportChildrenConfig
}[]
