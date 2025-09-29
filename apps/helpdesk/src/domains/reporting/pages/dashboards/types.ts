import { Tag } from '@gorgias/helpdesk-queries'

import { User } from 'config/types/user'
import { MetricPerDimensionFetch } from 'domains/reporting/hooks/distributions'
import { TagSelection } from 'domains/reporting/hooks/tags/useTagResultsSelection'
import { MetricTrendFetch } from 'domains/reporting/hooks/useMetricTrend'
import {
    TimeSeriesFetch,
    TimeSeriesPerDimensionFetch,
} from 'domains/reporting/hooks/useTimeSeries'
import {
    StaticFilter,
    StatsFilters,
    TicketTimeReference,
} from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { AutomateAiAgentsChart } from 'domains/reporting/pages/automate/ai-agent/AutomateAiAgentsReportConfig'
import { AiSalesAgentChart } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { AutomateOverviewChart } from 'domains/reporting/pages/automate/overview/AutomateOverviewReportConfig'
import { OptionalFilter } from 'domains/reporting/pages/common/filters/FiltersPanel'
import { MetricValueFormat } from 'domains/reporting/pages/common/utils'
import { CampaignsLegacyChart } from 'domains/reporting/pages/convert/campaigns/CampaignsLegacyReportConfig'
import { CampaignsChart } from 'domains/reporting/pages/convert/campaigns/CampaignsPerformanceReportConfig'
import { CampaignReportContext } from 'domains/reporting/pages/convert/components/DownloadOverviewData/GenerateReportService'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import { HelpCenterChart } from 'domains/reporting/pages/help-center/components/HelpCenterReport/HelpCenterReportConfig'
import { SatisfactionChart } from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionReportConfig'
import { ServiceLevelAgreementsChart } from 'domains/reporting/pages/sla/ServiceLevelAgreementsReportConfig'
import { AgentsChart } from 'domains/reporting/pages/support-performance/agents/SupportPerformanceAgentsReportConfig'
import { AutoQAChart } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAReportConfig'
import { BusiestTimesChart } from 'domains/reporting/pages/support-performance/busiest-times-of-days/BusiestTimesReportConfig'
import { BusiestTimeOfDaysMetrics } from 'domains/reporting/pages/support-performance/busiest-times-of-days/types'
import { ChannelsChart } from 'domains/reporting/pages/support-performance/channels/ChannelsReportConfig'
import { OverviewChart } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { TicketInsightsTagsChart } from 'domains/reporting/pages/ticket-insights/tags/TagsReportConfig'
import { TicketFieldsChart } from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketInsightsFieldsReportConfig'
import { VoiceAgentsChart } from 'domains/reporting/pages/voice/pages/VoiceAgentsReportConfig'
import { VoiceOverviewChart } from 'domains/reporting/pages/voice/pages/VoiceOverviewReportConfig'
import { TagsTableOrder } from 'domains/reporting/state/ui/stats/tagsReportSlice'
import { TicketInsightsOrder } from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import {
    AgentsTableColumn,
    AgentsTableRow,
    ChannelsTableColumns,
} from 'domains/reporting/state/ui/stats/types'
import { Channel } from 'models/channel/types'
import { Integration } from 'models/integration/types'

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

export type DashboardChartSchema = {
    type: DashboardChildType.Chart
    config_id: string
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
    granularity: ReportingGranularity,
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
    additionalProps?: any
}

export type ChartConfig = {
    chartComponent: (props: DashboardChartProps) => React.JSX.Element
    label: string
    csvProducer: DataExportFetch[] | null
    description: string
    chartType: ChartType
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
    | typeof TicketFieldsChart
    | typeof TicketInsightsTagsChart
    | typeof VoiceAgentsChart
    | typeof VoiceOverviewChart
    | typeof CampaignsChart
    | typeof CampaignsLegacyChart
    | typeof AiSalesAgentChart
    | typeof AutomateAiAgentsChart

export type ReportChildrenConfig = {
    type: AvailableChartIds
    config: ReportConfig<string>
}[]

export type ReportsModalConfig = {
    category: string
    children: ReportChildrenConfig
}[]
