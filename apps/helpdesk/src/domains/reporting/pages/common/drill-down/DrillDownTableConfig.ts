import type { FunctionComponent } from 'react'

import { AIJourneyDrillDownConfig } from 'AIJourney/configs/AIJourneyDrillDownConfig'
import type { DrillDownDataHook } from 'domains/reporting/hooks/useDrillDownData'
import {
    defaultEnrichmentFields,
    useEnrichedDrillDownData,
} from 'domains/reporting/hooks/useDrillDownData'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { AiAgentDrillDownConfig } from 'domains/reporting/pages/automate/aiAgent/AiAgentDrillDownConfig'
import { AiInsightsMetricConfig } from 'domains/reporting/pages/automate/AiInsightsMetricConfig'
import { AiSalesAgentDrillDownConfig } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentDrillDownConfig'
import type {
    ConvertDrillDownRowData,
    TicketDrillDownRowData,
    VoiceCallDrillDownRowData,
} from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import { formatTicketDrillDownRowData } from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import { getDrillDownQuery } from 'domains/reporting/pages/common/drill-down/helpers'
import { LegacyTicketDrillDownTableContent } from 'domains/reporting/pages/common/drill-down/LegacyTicketDrillDownTableContent'
import { TicketDrillDownTableContent } from 'domains/reporting/pages/common/drill-down/TicketDrillDownTableContent'
import type { ColumnConfig } from 'domains/reporting/pages/common/drill-down/types'
import { Domain } from 'domains/reporting/pages/common/drill-down/types'
import { ConvertDrillDownConfig } from 'domains/reporting/pages/convert/constants/CampaignsDrillDownConfig'
import { KnowledgeDrillDownConfig } from 'domains/reporting/pages/knowledge/KnowledgeDrillDownConfig'
import { KnowledgeMetricConfig } from 'domains/reporting/pages/knowledge/KnowledgeMetricConfig'
import {
    SatisfactionAverageSurveyScoreMetricConfig,
    SatisfactionMetricConfig,
} from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionMetricsConfig'
import { SlaMetricConfig } from 'domains/reporting/pages/sla/SlaConfig'
import { AgentsColumnConfig } from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import type { AutoQAAgentsTableColumn } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentsTableConfig'
import { AutoQAAgentsColumnConfig } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentsTableConfig'
import { TrendCardConfig } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAMetricsConfig'
import { ChannelColumnConfig } from 'domains/reporting/pages/support-performance/channels/ChannelsTableConfig'
import type { OverviewMetric } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { OverviewMetricConfig } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { TagsMetricConfig } from 'domains/reporting/pages/ticket-insights/tags/TagsMetricConfig'
import { TicketFieldsMetricConfig } from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketInsightsFieldsMetricConfig'
import { TicketVolumeConfig } from 'domains/reporting/pages/voice-of-customer/charts/ChangeInTicketVolumeChart/ticketVolumeConfig'
import { ProductInsightsColumnWithDrillDownConfig } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import type { VoiceOfCustomerMetricWithDrillDown } from 'domains/reporting/pages/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerMetricConfig'
import { VoiceOfCustomerMetricWithDrillDownConfig } from 'domains/reporting/pages/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerMetricConfig'
import { VoiceDrillDownConfig } from 'domains/reporting/pages/voice/VoiceConfigs/VoiceDrillDownConfig'
import type {
    AgentMetricColumn,
    DrillDownMetric,
    ProductMetricColumn,
} from 'domains/reporting/state/ui/stats/drillDownSlice'
import type { ProductsPerTicketColumn } from 'domains/reporting/state/ui/stats/productsPerTicketSlice'
import type {
    AgentsTableColumn,
    AIInsightsMetric,
    AutoQAMetric,
    ChannelsTableColumns,
    KnowledgeMetric,
    ProductInsightsTableColumns,
    SatisfactionAverageSurveyScoreMetric,
    SatisfactionMetric,
    SlaMetric,
    TagsMetric,
    TicketFieldsMetric,
} from 'domains/reporting/state/ui/stats/types'

export type DrillDownHook = DrillDownDataHook<
    TicketDrillDownRowData | ConvertDrillDownRowData | VoiceCallDrillDownRowData
>

export type InfoBarObjectType = 'tickets' | 'orders' | 'voice calls'

export function singular(objectType: InfoBarObjectType): string {
    switch (objectType) {
        case 'tickets':
            return 'ticket'
        case 'orders':
            return 'order'
        case 'voice calls':
            return 'voice call'
    }
}

export type DomainConfig<T extends string> = {
    drillDownHook: DrillDownHook
    tableComponent: FunctionComponent<{
        metricData: DrillDownMetric
        columnConfig: ColumnConfig
    }>
    legacyTableComponent: FunctionComponent<{
        metricData: DrillDownMetric
        columnConfig: ColumnConfig
    }>
    infoBarObjectType: InfoBarObjectType
    isMetricDataDownloadable: boolean
    modalTriggerTooltipText: string
    metricsConfig: Record<T, MetricConfig>
}

type MetricConfig = {
    showMetric: boolean
    domain: Domain
}

const useTicketDrillDownHook = (metricData: DrillDownMetric) =>
    useEnrichedDrillDownData(
        getDrillDownQuery(metricData),
        metricData,
        defaultEnrichmentFields,
        formatTicketDrillDownRowData,
        EnrichmentFields.TicketId,
    )

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
    | ProductMetricColumn
    | VoiceOfCustomerMetricWithDrillDown
    | ProductInsightsTableColumns.ReturnMentions
    | ProductsPerTicketColumn.TicketVolume
    | KnowledgeMetric
> = {
    drillDownHook: useTicketDrillDownHook,
    tableComponent: TicketDrillDownTableContent,
    legacyTableComponent: LegacyTicketDrillDownTableContent,
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
        ...ProductInsightsColumnWithDrillDownConfig,
        ...VoiceOfCustomerMetricWithDrillDownConfig,
        ...TicketVolumeConfig,
        ...KnowledgeMetricConfig,
    },
}

export const DomainsConfig = {
    [Domain.Convert]: ConvertDrillDownConfig,
    [Domain.Ticket]: TicketDrillDownConfig,
    [Domain.Voice]: VoiceDrillDownConfig,
    [Domain.AiSalesAgent]: AiSalesAgentDrillDownConfig,
    [Domain.AiAgent]: AiAgentDrillDownConfig,
    [Domain.AIJourney]: AIJourneyDrillDownConfig,
    [Domain.Knowledge]: KnowledgeDrillDownConfig,
}

export const MetricsConfig: Record<
    DrillDownMetric['metricName'],
    MetricConfig
> = {
    ...TicketDrillDownConfig.metricsConfig,
    ...ConvertDrillDownConfig.metricsConfig,
    ...VoiceDrillDownConfig.metricsConfig,
    ...AiSalesAgentDrillDownConfig.metricsConfig,
    ...AiAgentDrillDownConfig.metricsConfig,
    ...AIJourneyDrillDownConfig.metricsConfig,
    ...KnowledgeDrillDownConfig.metricsConfig,
}
