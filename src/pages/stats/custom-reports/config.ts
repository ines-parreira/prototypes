import _flatten from 'lodash/flatten'

import {
    AutomateOverviewChart,
    AutomateOverviewReportConfig,
} from 'pages/stats/automate/overview/AutomateOverviewReportConfig'
import {
    CampaignsChart,
    CampaignsPerformanceReportConfig,
} from 'pages/stats/convert/campaigns/CampaignsPerformanceReportConfig'
import { ReportsIDs } from 'pages/stats/custom-reports/constants'
import {
    ChartConfig,
    ReportConfig,
    ReportsModalConfig,
} from 'pages/stats/custom-reports/types'
import {
    HelpCenterChart,
    HelpCenterReportConfig,
} from 'pages/stats/help-center/components/HelpCenterReport/HelpCenterReportConfig'
import {
    SatisfactionChart,
    SatisfactionReportConfig,
} from 'pages/stats/quality-management/satisfaction/SatisfactionReportConfig'
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
                id: ReportsIDs.SupportPerformanceOverviewReportConfig,
            },
            {
                type: AgentsChart,
                config: SupportPerformanceAgentsReportConfig,
                id: ReportsIDs.SupportPerformanceAgentsReportConfig,
            },
            {
                type: BusiestTimesChart,
                config: BusiestTimesReportConfig,
                id: ReportsIDs.BusiestTimesReportConfig,
            },
            {
                type: ChannelsChart,
                config: ChannelsReportConfig,
                id: ReportsIDs.ChannelsReportConfig,
            },
            {
                type: ServiceLevelAgreementsChart,
                config: ServiceLevelAgreementsReportConfig,
                id: ReportsIDs.ServiceLevelAgreementsReportConfig,
            },
            {
                type: HelpCenterChart,
                config: HelpCenterReportConfig,
                id: ReportsIDs.HelpCenterReportConfig,
            },
        ],
    },
    {
        category: 'Ticket Insights',
        children: [
            {
                type: TicketFieldsChart,
                config: TicketFieldsReportConfig,
                id: ReportsIDs.TicketFieldsReportConfig,
            },
            {
                type: TicketInsightsTagsChart,
                config: TicketInsightsTagsReportConfig,
                id: ReportsIDs.TicketInsightsTagsReportConfig,
            },
        ],
    },
    {
        category: 'Quality management',
        children: [
            {
                type: AutoQAChart,
                config: AutoQAReportConfig,
                id: ReportsIDs.AutoQAReportConfig,
            },
            {
                type: SatisfactionChart,
                config: SatisfactionReportConfig,
                id: ReportsIDs.SatisfactionReportConfig,
            },
        ],
    },
    {
        category: 'Automate',
        children: [
            {
                type: AutomateOverviewChart,
                config: AutomateOverviewReportConfig,
                id: ReportsIDs.AutomateOverviewReportConfig,
            },
        ],
    },
    {
        category: 'Convert',
        children: [
            {
                type: CampaignsChart,
                config: CampaignsPerformanceReportConfig,
                id: ReportsIDs.CampaignsReportConfig,
            },
        ],
    },
    {
        category: 'Voice',
        children: [
            {
                type: VoiceOverviewChart,
                config: VoiceOverviewReportConfig,
                id: ReportsIDs.VoiceOverviewReportConfig,
            },
            {
                type: VoiceAgentsChart,
                config: VoiceAgentsReportConfig,
                id: ReportsIDs.VoiceAgentsReportConfig,
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
                id: ReportsIDs.SupportPerformanceRevenueReportConfig,
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

    const report = availableReports.find((report) => report.id === reportId)

    return report?.config || null
}
