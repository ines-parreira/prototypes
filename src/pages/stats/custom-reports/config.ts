import _flatten from 'lodash/flatten'

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

export const MAX_CHECKED_CHARTS = 20

export const REPORTS_MODAL_CONFIG: ReportsModalConfig = [
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
                type: SatisfactionChart,
                config: SatisfactionReportConfig,
            },
        ],
    },
    {
        category: 'Voice',
        children: [
            {
                type: VoiceAgentsChart,
                config: VoiceAgentsReportConfig,
            },
        ],
    },
]

export const getComponentConfig = (
    configId: string
): {
    reportConfig: ReportConfig<string> | null
    chartConfig: ChartConfig | null
} => {
    const availableCharts = _flatten(
        REPORTS_MODAL_CONFIG.map((report) => report.children)
    )
    for (const chart of availableCharts) {
        if (Object.values(chart.type).includes(configId)) {
            return {
                reportConfig: chart.config,
                chartConfig: chart.config.charts[configId],
            }
        }
    }

    return {reportConfig: null, chartConfig: null}
}
