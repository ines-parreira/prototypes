import type { StaticFilter } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { AUTO_QA_FILTER_KEYS } from 'domains/reporting/pages/common/filters/constants'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { AGENT_PERFORMANCE_SECTION_TITLE } from 'domains/reporting/pages/support-performance/agents/AgentsTableChart'
import { AccuracyTrendCard } from 'domains/reporting/pages/support-performance/auto-qa/AccuracyTrendCard'
import {
    AUTO_QA_TITLE_TOOLTIP,
    AutoQaAgentsTableChart,
} from 'domains/reporting/pages/support-performance/auto-qa/AutoQaAgentsTableChart'
import { TrendCardConfig } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAMetricsConfig'
import { BrandVoiceTrendCard } from 'domains/reporting/pages/support-performance/auto-qa/BrandVoiceTrendCard'
import { CommunicationSkillsTrendCard } from 'domains/reporting/pages/support-performance/auto-qa/CommunicationSkillsTrendCard'
import { EfficiencyTrendCard } from 'domains/reporting/pages/support-performance/auto-qa/EfficiencyTrendCard'
import { InternalComplianceTrendCard } from 'domains/reporting/pages/support-performance/auto-qa/InternalComplianceTrendCard'
import { LanguageProficiencyTrendCard } from 'domains/reporting/pages/support-performance/auto-qa/LanguageProficiencyTrendCard'
import { ResolutionCompletenessTrendCard } from 'domains/reporting/pages/support-performance/auto-qa/ResolutionCompletenessTrendCard'
import { ReviewedClosedTicketsTrendCard } from 'domains/reporting/pages/support-performance/auto-qa/ReviewedClosedTicketsTrendCard'
import { fetchAutoQAAgentsTableReportData } from 'domains/reporting/services/autoQAReportingService'
import { AutoQAMetric } from 'domains/reporting/state/ui/stats/types'
import { STATS_ROUTES } from 'routes/constants'

export enum AutoQAChart {
    ReviewedClosedTickets = 'auto_qa_reviewed_closed_tickets_trend_chart',
    ResolutionCompleteness = 'auto_qa_resolution_completeness_trend_chart',
    CommunicationSkills = 'auto_qa_communication_skills_trend_chart',
    LanguageProficiency = 'auto_qa_language_proficiency_trend_chart',
    Accuracy = 'auto_qa_accuracy_trend_chart',
    Efficiency = 'auto_qa_efficiency_trend_chart',
    InternalCompliance = 'auto_qa_internal_compliance_trend_chart',
    BrandVoice = 'auto_qa_brand_voice_trend_chart',
    AgentsTable = 'auto_qa_agents_table_chart',
}

export const AUTO_QA_PAGE_TITLE = 'Auto QA'
export const AUTO_QA_PERSISTENT_FILTERS: StaticFilter[] = [FilterKey.Period]
export const AUTO_QA_OPTIONAL_FILTERS = [
    FilterKey.Integrations,
    FilterKey.Channels,
    FilterKey.Agents,
    FilterKey.Tags,
    FilterKey.CustomFields,
    FilterKey.Score,
    FilterKey.Stores,
    ...AUTO_QA_FILTER_KEYS,
]
export const AutoQAReportConfig: ReportConfig<AutoQAChart> = {
    id: ReportsIDs.AutoQAReportConfig,
    reportName: AUTO_QA_PAGE_TITLE,
    reportPath: STATS_ROUTES.QUALITY_MANAGEMENT_AUTO_QA,
    charts: {
        [AutoQAChart.ReviewedClosedTickets]: {
            chartComponent: ReviewedClosedTicketsTrendCard,
            label: TrendCardConfig[AutoQAMetric.ReviewedClosedTickets].title,
            description:
                TrendCardConfig[AutoQAMetric.ReviewedClosedTickets].hint.title,
            csvProducer: [
                {
                    type: DataExportFormat.Trend,
                    fetch: TrendCardConfig[AutoQAMetric.ReviewedClosedTickets]
                        .fetchTrend,
                    metricFormat:
                        TrendCardConfig[AutoQAMetric.ReviewedClosedTickets]
                            .metricFormat,
                },
            ],
            chartType: ChartType.Card,
        },
        [AutoQAChart.ResolutionCompleteness]: {
            chartComponent: ResolutionCompletenessTrendCard,
            label: TrendCardConfig[AutoQAMetric.ResolutionCompleteness].title,
            description:
                TrendCardConfig[AutoQAMetric.ResolutionCompleteness].hint.title,
            csvProducer: [
                {
                    type: DataExportFormat.Trend,
                    fetch: TrendCardConfig[AutoQAMetric.ResolutionCompleteness]
                        .fetchTrend,
                    metricFormat:
                        TrendCardConfig[AutoQAMetric.ResolutionCompleteness]
                            .metricFormat,
                },
            ],
            chartType: ChartType.Card,
        },
        [AutoQAChart.CommunicationSkills]: {
            chartComponent: CommunicationSkillsTrendCard,
            label: TrendCardConfig[AutoQAMetric.CommunicationSkills].title,
            description:
                TrendCardConfig[AutoQAMetric.CommunicationSkills].hint.title,
            csvProducer: [
                {
                    type: DataExportFormat.Trend,
                    fetch: TrendCardConfig[AutoQAMetric.CommunicationSkills]
                        .fetchTrend,
                    metricFormat:
                        TrendCardConfig[AutoQAMetric.CommunicationSkills]
                            .metricFormat,
                },
            ],
            chartType: ChartType.Card,
        },
        [AutoQAChart.LanguageProficiency]: {
            chartComponent: LanguageProficiencyTrendCard,
            label: TrendCardConfig[AutoQAMetric.LanguageProficiency].title,
            description:
                TrendCardConfig[AutoQAMetric.LanguageProficiency].hint.title,
            csvProducer: [
                {
                    type: DataExportFormat.Trend,
                    fetch: TrendCardConfig[AutoQAMetric.LanguageProficiency]
                        .fetchTrend,
                    metricFormat:
                        TrendCardConfig[AutoQAMetric.LanguageProficiency]
                            .metricFormat,
                },
            ],
            chartType: ChartType.Card,
        },
        [AutoQAChart.Accuracy]: {
            chartComponent: AccuracyTrendCard,
            label: TrendCardConfig[AutoQAMetric.Accuracy].title,
            description: TrendCardConfig[AutoQAMetric.Accuracy].hint.title,
            csvProducer: [
                {
                    type: DataExportFormat.Trend,
                    fetch: TrendCardConfig[AutoQAMetric.Accuracy].fetchTrend,
                    metricFormat:
                        TrendCardConfig[AutoQAMetric.Accuracy].metricFormat,
                },
            ],
            chartType: ChartType.Card,
        },
        [AutoQAChart.Efficiency]: {
            chartComponent: EfficiencyTrendCard,
            label: TrendCardConfig[AutoQAMetric.Efficiency].title,
            description: TrendCardConfig[AutoQAMetric.Efficiency].hint.title,
            csvProducer: [
                {
                    type: DataExportFormat.Trend,
                    fetch: TrendCardConfig[AutoQAMetric.Efficiency].fetchTrend,
                    metricFormat:
                        TrendCardConfig[AutoQAMetric.Efficiency].metricFormat,
                },
            ],
            chartType: ChartType.Card,
        },
        [AutoQAChart.InternalCompliance]: {
            chartComponent: InternalComplianceTrendCard,
            label: TrendCardConfig[AutoQAMetric.InternalCompliance].title,
            description:
                TrendCardConfig[AutoQAMetric.InternalCompliance].hint.title,
            csvProducer: [
                {
                    type: DataExportFormat.Trend,
                    fetch: TrendCardConfig[AutoQAMetric.InternalCompliance]
                        .fetchTrend,
                    metricFormat:
                        TrendCardConfig[AutoQAMetric.InternalCompliance]
                            .metricFormat,
                },
            ],
            chartType: ChartType.Card,
        },
        [AutoQAChart.BrandVoice]: {
            chartComponent: BrandVoiceTrendCard,
            label: TrendCardConfig[AutoQAMetric.BrandVoice].title,
            description: TrendCardConfig[AutoQAMetric.BrandVoice].hint.title,
            csvProducer: [
                {
                    type: DataExportFormat.Trend,
                    fetch: TrendCardConfig[AutoQAMetric.BrandVoice].fetchTrend,
                    metricFormat:
                        TrendCardConfig[AutoQAMetric.BrandVoice].metricFormat,
                },
            ],
            chartType: ChartType.Card,
        },
        [AutoQAChart.AgentsTable]: {
            chartComponent: AutoQaAgentsTableChart,
            label: AGENT_PERFORMANCE_SECTION_TITLE,
            description: AUTO_QA_TITLE_TOOLTIP,
            csvProducer: [
                {
                    type: DataExportFormat.Table,
                    fetch: fetchAutoQAAgentsTableReportData,
                },
            ],
            chartType: ChartType.Table,
        },
    },
    reportFilters: {
        optional: AUTO_QA_OPTIONAL_FILTERS,
        persistent: AUTO_QA_PERSISTENT_FILTERS,
    },
}
