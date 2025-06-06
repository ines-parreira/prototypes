import _flatten from 'lodash/flatten'

import {
    AutomateAiAgentsChart,
    AutomateAiAgentsReportConfig,
} from 'pages/stats/automate/ai-agent/AutomateAiAgentsReportConfig'
import { AiSalesAgentChart } from 'pages/stats/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { AiSalesAgentReportConfig } from 'pages/stats/automate/aiSalesAgent/AiSalesAgentReportConfig'
import {
    AutomateOverviewChart,
    AutomateOverviewReportConfig,
} from 'pages/stats/automate/overview/AutomateOverviewReportConfig'
import { STATS_ROUTE_PREFIX } from 'pages/stats/common/components/constants'
import {
    CampaignsChart,
    CampaignsPerformanceReportConfig,
} from 'pages/stats/convert/campaigns/CampaignsPerformanceReportConfig'
import {
    ChartConfig,
    ReportConfig,
    ReportsModalConfig,
} from 'pages/stats/dashboards/types'
import {
    HelpCenterChart,
    HelpCenterReportConfig,
} from 'pages/stats/help-center/components/HelpCenterReport/HelpCenterReportConfig'
import {
    SatisfactionChart,
    SatisfactionReportConfig,
} from 'pages/stats/quality-management/satisfaction/SatisfactionReportConfig'
import { PerformanceByFeatureReportConfig } from 'pages/stats/self-service/AIAgentPerformanceByFeatureReportConfig'
import {
    ServiceLevelAgreementsChart,
    ServiceLevelAgreementsReportConfig,
} from 'pages/stats/sla/ServiceLevelAgreementsReportConfig'
import {
    AgentsChart,
    SupportPerformanceAgentsReportConfig,
} from 'pages/stats/support-performance/agents/SupportPerformanceAgentsReportConfig'
import {
    AutoQAChart,
    AutoQAReportConfig,
} from 'pages/stats/support-performance/auto-qa/AutoQAReportConfig'
import {
    BusiestTimesChart,
    BusiestTimesReportConfig,
} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesReportConfig'
import {
    ChannelsChart,
    ChannelsReportConfig,
} from 'pages/stats/support-performance/channels/ChannelsReportConfig'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { SupportPerformanceRevenueReportConfig } from 'pages/stats/support-performance/revenue/SupportPerformanceRevenueReportConfig'
import { SupportPerformanceSatisfactionReportConfig } from 'pages/stats/support-performance/satisfaction/SupportPerformanceSatisfactionReportConfig'
import {
    TicketInsightsTagsChart,
    TicketInsightsTagsReportConfig,
} from 'pages/stats/ticket-insights/tags/TagsReportConfig'
import {
    TicketFieldsChart,
    TicketFieldsReportConfig,
} from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldsReportConfig'
import {
    VoiceAgentsChart,
    VoiceAgentsReportConfig,
} from 'pages/stats/voice/pages/VoiceAgentsReportConfig'
import {
    VoiceOverviewChart,
    VoiceOverviewReportConfig,
} from 'pages/stats/voice/pages/VoiceOverviewReportConfig'

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
