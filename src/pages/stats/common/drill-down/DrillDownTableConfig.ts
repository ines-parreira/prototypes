import { FunctionComponent } from 'react'

import {
    defaultEnrichmentFields,
    DrillDownDataHook,
    useEnrichedDrillDownData,
} from 'hooks/reporting/useDrillDownData'
import { OrderDirection } from 'models/api/types'
import { DrillDownReportingQuery } from 'models/job/types'
import { EnrichmentFields } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { AiInsightsMetricConfig } from 'pages/stats/automate/AiInsightsMetricConfig'
import {
    ConvertDrillDownRowData,
    formatTicketDrillDownRowData,
    TicketDrillDownRowData,
    VoiceCallDrillDownRowData,
} from 'pages/stats/common/drill-down/DrillDownFormatters'
import { TicketDrillDownTableContent } from 'pages/stats/common/drill-down/TicketDrillDownTableContent'
import { Domain } from 'pages/stats/common/drill-down/types'
import { ConvertDrillDownConfig } from 'pages/stats/convert/constants/CampaignsDrillDownConfig'
import {
    SatisfactionAverageSurveyScoreMetricConfig,
    SatisfactionMetricConfig,
} from 'pages/stats/quality-management/satisfaction/SatisfactionMetricsConfig'
import { SlaMetricConfig } from 'pages/stats/sla/SlaConfig'
import { AgentsColumnConfig } from 'pages/stats/support-performance/agents/AgentsTableConfig'
import {
    AutoQAAgentsColumnConfig,
    AutoQAAgentsTableColumn,
} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTableConfig'
import { TrendCardConfig } from 'pages/stats/support-performance/auto-qa/AutoQAMetricsConfig'
import { ChannelColumnConfig } from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { TagsMetricConfig } from 'pages/stats/ticket-insights/tags/TagsMetricConfig'
import { TicketFieldsMetricConfig } from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldsMetricConfig'
import { VoiceDrillDownConfig } from 'pages/stats/voice/VoiceDrillDownConfig'
import {
    AgentMetricColumn,
    DrillDownMetric,
} from 'state/ui/stats/drillDownSlice'
import {
    AgentsTableColumn,
    AIInsightsMetric,
    AutoQAMetric,
    ChannelsTableColumns,
    SatisfactionAverageSurveyScoreMetric,
    SatisfactionMetric,
    SlaMetric,
    TagsMetric,
    TicketFieldsMetric,
} from 'state/ui/stats/types'

export type DrillDownHook = DrillDownDataHook<
    TicketDrillDownRowData | ConvertDrillDownRowData | VoiceCallDrillDownRowData
>
export type DrillDownQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
) => DrillDownReportingQuery

export type DomainConfig<T extends string> = {
    drillDownHook: DrillDownHook
    tableComponent: FunctionComponent<{
        metricData: DrillDownMetric
    }>
    infoBarObjectType: string
    isMetricDataDownloadable: boolean
    modalTriggerTooltipText: string
    metricsConfig: Record<T, MetricConfig>
}

type MetricConfig = {
    showMetric: boolean
    domain: Domain
}

const TicketDrillDownConfig: DomainConfig<
    | OverviewMetric
    | AgentsTableColumn
    | AgentMetricColumn
    | ChannelsTableColumns
    | AutoQAAgentsTableColumn
    | AutoQAMetric
    | SatisfactionMetric
    | SatisfactionAverageSurveyScoreMetric
    | SlaMetric
    | TagsMetric
    | TicketFieldsMetric
    | AIInsightsMetric
> = {
    drillDownHook: (metricData: DrillDownMetric) =>
        useEnrichedDrillDownData(
            metricData,
            defaultEnrichmentFields,
            formatTicketDrillDownRowData,
            EnrichmentFields.TicketId,
        ),
    tableComponent: TicketDrillDownTableContent,
    infoBarObjectType: 'tickets',
    isMetricDataDownloadable: true,
    modalTriggerTooltipText: 'Click to view tickets',
    metricsConfig: {
        ...OverviewMetricConfig,
        ...AgentsColumnConfig,
        ...ChannelColumnConfig,
        ...AutoQAAgentsColumnConfig,
        ...TrendCardConfig,
        ...SatisfactionMetricConfig,
        ...SatisfactionAverageSurveyScoreMetricConfig,
        ...SlaMetricConfig,
        ...TagsMetricConfig,
        ...TicketFieldsMetricConfig,
        ...AiInsightsMetricConfig,
    },
}

export const DomainsConfig = {
    [Domain.Convert]: ConvertDrillDownConfig,
    [Domain.Ticket]: TicketDrillDownConfig,
    [Domain.Voice]: VoiceDrillDownConfig,
}

export const MetricsConfig: Record<
    DrillDownMetric['metricName'],
    MetricConfig
> = {
    ...TicketDrillDownConfig.metricsConfig,
    ...ConvertDrillDownConfig.metricsConfig,
    ...VoiceDrillDownConfig.metricsConfig,
}
