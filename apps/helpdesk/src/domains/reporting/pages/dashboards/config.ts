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
    ChannelsEmailReportConfig,
    PerformanceChannelsEmailChart,
} from 'domains/reporting/pages/performance/channels/email/ChannelsEmailReportConfig'
import {
    ChannelsVoiceReportConfig,
    PerformanceChannelsVoiceChart,
} from 'domains/reporting/pages/performance/channels/voice/ChannelsVoiceReportConfig'
import {
    PerformanceOverviewChart,
    PerformanceOverviewReportConfig,
} from 'domains/reporting/pages/performance/overview/PerformanceOverviewReportConfig'
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
    AnalyticsAiAgentAllAgentsChart,
    AnalyticsAiAgentAllAgentsReportConfig,
} from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentAllAgentsReportConfig'
import {
    AnalyticsAiAgentShoppingAssistantChart,
    AnalyticsAiAgentShoppingAssistantReportConfig,
} from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentShoppingAssistantReportConfig'
import {
    AnalyticsAiAgentSupportAgentChart,
    AnalyticsAiAgentSupportAgentReportConfig,
} from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentSupportAgentReportConfig'
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

export const REVAMPED_REPORTS_CONFIG: ReportsModalConfig = REPORTS_CONFIG.map(
    (section) => {
        if (section.category !== 'AI Agent') {
            return section
        }
        return {
            category: 'AI Agent',
            children: [
                {
                    type: AnalyticsOverviewChart,
                    config: AnalyticsOverviewReportConfig,
                },
                {
                    type: AnalyticsAiAgentAllAgentsChart,
                    config: AnalyticsAiAgentAllAgentsReportConfig,
                },
                {
                    type: AnalyticsAiAgentShoppingAssistantChart,
                    config: AnalyticsAiAgentShoppingAssistantReportConfig,
                },
                {
                    type: AnalyticsAiAgentSupportAgentChart,
                    config: AnalyticsAiAgentSupportAgentReportConfig,
                },
            ],
        }
    },
)

export const PERFORMANCE_REPORTS_CONFIG: ReportsModalConfig = [
    {
        category: 'Performance',
        children: [
            {
                type: PerformanceOverviewChart,
                config: PerformanceOverviewReportConfig,
            },
            {
                type: PerformanceChannelsEmailChart,
                config: ChannelsEmailReportConfig,
            },
            {
                type: PerformanceChannelsVoiceChart,
                config: ChannelsVoiceReportConfig,
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
    category: string | null
} => {
    const allSections = withLegacyReports
        ? [
              ...REPORTS_CONFIG,
              ...REVAMPED_REPORTS_CONFIG,
              ...PERFORMANCE_REPORTS_CONFIG,
              ...LEGACY_REPORTS_CONFIG,
          ]
        : [
              ...REPORTS_CONFIG,
              ...REVAMPED_REPORTS_CONFIG,
              ...PERFORMANCE_REPORTS_CONFIG,
          ]

    for (const section of allSections) {
        for (const report of section.children) {
            if (Object.values(report.type).includes(chartId)) {
                return {
                    reportConfig: report.config,
                    chartConfig: report.config.charts[chartId],
                    category: section.category,
                }
            }
        }
    }

    return {
        reportConfig: null,
        chartConfig: null,
        category: null,
    }
}

type MetricOriginParts = {
    prefix: string | null
    suffix: string
}

export const getMetricOriginPath = (
    chartId: string,
    withLegacyReports?: boolean,
): MetricOriginParts | null => {
    const { reportConfig, category } = getComponentConfig(
        chartId,
        withLegacyReports,
    )
    if (!reportConfig) return null

    if (!category) return { prefix: null, suffix: reportConfig.reportName }
    return { prefix: category, suffix: reportConfig.reportName }
}

export const getReportConfig = (
    reportId: string,
    withLegacyReports?: boolean,
): ReportConfig<string> | null => {
    const availableReports = (
        (withLegacyReports
            ? [
                  ...REPORTS_CONFIG,
                  ...REVAMPED_REPORTS_CONFIG,
                  ...PERFORMANCE_REPORTS_CONFIG,
                  ...LEGACY_REPORTS_CONFIG,
              ]
            : [
                  ...REPORTS_CONFIG,
                  ...REVAMPED_REPORTS_CONFIG,
                  ...PERFORMANCE_REPORTS_CONFIG,
              ]
        ).map((report) => report.children) ?? []
    ).flat()

    const report = availableReports.find(
        (report) => report.config.id === reportId,
    )

    return report?.config || null
}

export const getReportConfigFromPath = (
    reportPath: string,
): ReportConfig<string> | null => {
    const availableReports = (
        [
            ...REPORTS_CONFIG,
            ...REVAMPED_REPORTS_CONFIG,
            ...PERFORMANCE_REPORTS_CONFIG,
            ...LEGACY_REPORTS_CONFIG,
        ].map((report) => report.children) ?? []
    ).flat()

    const report = availableReports.find(
        (report) =>
            `${STATS_ROUTE_PREFIX}${report.config.reportPath}` === reportPath,
    )

    return report?.config || null
}
