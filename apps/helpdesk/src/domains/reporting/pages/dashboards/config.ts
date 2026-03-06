import _flatten from 'lodash/flatten'

import {
    AutomateAiAgentsChart,
    AutomateAiAgentsReportConfig,
} from 'domains/reporting/pages/automate/ai-agent/AutomateAiAgentsReportConfig'
import { AiSalesAgentChart } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { AiSalesAgentReportConfig } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentReportConfig'
import {
    AutomateOverviewChart,
    AutomateOverviewReportConfig,
} from 'domains/reporting/pages/automate/overview/AutomateOverviewReportConfig'
import { STATS_ROUTE_PREFIX } from 'domains/reporting/pages/common/components/constants'
import {
    CampaignsChart,
    CampaignsPerformanceReportConfig,
} from 'domains/reporting/pages/convert/campaigns/CampaignsPerformanceReportConfig'
import type {
    ChartConfig,
    ReportConfig,
    ReportsModalConfig,
} from 'domains/reporting/pages/dashboards/types'
import {
    HelpCenterChart,
    HelpCenterReportConfig,
} from 'domains/reporting/pages/help-center/components/HelpCenterReport/HelpCenterReportConfig'
import {
    SatisfactionChart,
    SatisfactionReportConfig,
} from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionReportConfig'
import { PerformanceByFeatureReportConfig } from 'domains/reporting/pages/self-service/AIAgentPerformanceByFeatureReportConfig'
import {
    ServiceLevelAgreementsChart,
    ServiceLevelAgreementsReportConfig,
} from 'domains/reporting/pages/sla/ServiceLevelAgreementsReportConfig'
import {
    VoiceServiceLevelAgreementsChart,
    VoiceServiceLevelAgreementsReportConfig,
} from 'domains/reporting/pages/sla/voice/VoiceServiceLevelAgreementsReportConfig'
import {
    AgentsChart,
    SupportPerformanceAgentsReportConfig,
} from 'domains/reporting/pages/support-performance/agents/SupportPerformanceAgentsReportConfig'
import {
    AutoQAChart,
    AutoQAReportConfig,
} from 'domains/reporting/pages/support-performance/auto-qa/AutoQAReportConfig'
import {
    BusiestTimesChart,
    BusiestTimesReportConfig,
} from 'domains/reporting/pages/support-performance/busiest-times-of-days/BusiestTimesReportConfig'
import {
    ChannelsChart,
    ChannelsReportConfig,
} from 'domains/reporting/pages/support-performance/channels/ChannelsReportConfig'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { SupportPerformanceRevenueReportConfig } from 'domains/reporting/pages/support-performance/revenue/SupportPerformanceRevenueReportConfig'
import { SupportPerformanceSatisfactionReportConfig } from 'domains/reporting/pages/support-performance/satisfaction/SupportPerformanceSatisfactionReportConfig'
import {
    TicketInsightsTagsChart,
    TicketInsightsTagsReportConfig,
} from 'domains/reporting/pages/ticket-insights/tags/TagsReportConfig'
import {
    TicketFieldsChart,
    TicketFieldsReportConfig,
} from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketInsightsFieldsReportConfig'
import {
    VoiceAgentsChart,
    VoiceAgentsReportConfig,
} from 'domains/reporting/pages/voice/pages/VoiceAgentsReportConfig'
import {
    VoiceOverviewChart,
    VoiceOverviewReportConfig,
} from 'domains/reporting/pages/voice/pages/VoiceOverviewReportConfig'
import {
    AnalyticsOverviewChart,
    AnalyticsOverviewReportConfig,
} from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'

export const MAX_CHECKED_CHARTS = 20

export const REPORTS_CONFIG: ReportsModalConfig = [
    {
        category: 'Support Performance',
        children: [
            {
                type: OverviewChart,
                config: SupportPerformanceOverviewReportConfig,
            },
            {
                type: AgentsChart,
                config: SupportPerformanceAgentsReportConfig,
            },
            {
                type: BusiestTimesChart,
                config: BusiestTimesReportConfig,
            },
            {
                type: ChannelsChart,
                config: ChannelsReportConfig,
            },
            {
                type: ServiceLevelAgreementsChart,
                config: ServiceLevelAgreementsReportConfig,
            },
            {
                type: VoiceServiceLevelAgreementsChart,
                config: VoiceServiceLevelAgreementsReportConfig,
            },
            {
                type: HelpCenterChart,
                config: HelpCenterReportConfig,
            },
        ],
    },
    {
        category: 'Ticket Insights',
        children: [
            {
                type: TicketFieldsChart,
                config: TicketFieldsReportConfig,
            },
            {
                type: TicketInsightsTagsChart,
                config: TicketInsightsTagsReportConfig,
            },
        ],
    },
    {
        category: 'Quality management',
        children: [
            {
                type: AutoQAChart,
                config: AutoQAReportConfig,
            },
            {
                type: SatisfactionChart,
                config: SatisfactionReportConfig,
            },
        ],
    },
    {
        category: 'AI Agent',
        children: [
            {
                type: AnalyticsOverviewChart,
                config: AnalyticsOverviewReportConfig,
                hidden: true,
            },
            {
                type: AutomateOverviewChart,
                config: AutomateOverviewReportConfig,
            },
            {
                type: AiSalesAgentChart,
                config: AiSalesAgentReportConfig,
            },
        ],
    },
    {
        category: 'Convert',
        children: [
            {
                type: CampaignsChart,
                config: CampaignsPerformanceReportConfig,
            },
        ],
    },
    {
        category: 'Voice',
        children: [
            {
                type: VoiceOverviewChart,
                config: VoiceOverviewReportConfig,
            },
            {
                type: VoiceAgentsChart,
                config: VoiceAgentsReportConfig,
            },
        ],
    },
]

export const LEGACY_REPORTS_CONFIG: ReportsModalConfig = [
    {
        category: 'Support Performance',
        children: [
            {
                type: OverviewChart,
                config: SupportPerformanceRevenueReportConfig,
            },
            {
                type: OverviewChart,
                config: SupportPerformanceSatisfactionReportConfig,
            },
        ],
    },
    {
        category: 'AI Agent',
        children: [
            {
                type: AutomateAiAgentsChart,
                config: AutomateAiAgentsReportConfig,
            },
            {
                type: AutomateAiAgentsChart,
                config: PerformanceByFeatureReportConfig,
            },
        ],
    },
]

export const getComponentConfig = (
    chartId: string,
    withLegacyReports?: boolean,
): {
    reportConfig: ReportConfig<string> | null
    chartConfig: ChartConfig | null
} => {
    const availableReports = _flatten(
        (withLegacyReports
            ? [...REPORTS_CONFIG, ...LEGACY_REPORTS_CONFIG]
            : REPORTS_CONFIG
        ).map((report) => report.children),
    )
    for (const report of availableReports) {
        if (Object.values(report.type).includes(chartId)) {
            return {
                reportConfig: report.config,
                chartConfig: report.config.charts[chartId],
            }
        }
    }

    return { reportConfig: null, chartConfig: null }
}

export const getReportConfig = (
    reportId: string,
    withLegacyReports?: boolean,
): ReportConfig<string> | null => {
    const availableReports = _flatten(
        (withLegacyReports
            ? [...REPORTS_CONFIG, ...LEGACY_REPORTS_CONFIG]
            : REPORTS_CONFIG
        ).map((report) => report.children),
    )

    const report = availableReports.find(
        (report) => report.config.id === reportId,
    )

    return report?.config || null
}

export const getReportConfigFromPath = (
    reportPath: string,
): ReportConfig<string> | null => {
    const availableReports = _flatten(
        [...REPORTS_CONFIG, ...LEGACY_REPORTS_CONFIG].map(
            (report) => report.children,
        ),
    )

    const report = availableReports.find(
        (report) =>
            `${STATS_ROUTE_PREFIX}${report.config.reportPath}` === reportPath,
    )

    return report?.config || null
}
