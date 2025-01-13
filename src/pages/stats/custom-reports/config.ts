import {ReportsModalConfig} from 'pages/stats/custom-reports/types'
import {
    SatisfactionChart,
    SatisfactionReportConfig,
} from 'pages/stats/quality-management/satisfaction/SatisfactionReportConfig'
import {
    ServiceLevelAgreementsChart,
    ServiceLevelAgreementsConfig,
} from 'pages/stats/sla/ServiceLevelAgreementsConfig'
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
    TicketInsightsTagsConfig,
} from 'pages/stats/ticket-insights/tags/TagsConfig'
import {
    TicketFieldsChart,
    TicketFieldsConfig,
} from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldsConfig'

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
                type: ServiceLevelAgreementsChart,
                config: ServiceLevelAgreementsConfig,
            },
        ],
    },
    {
        category: 'Ticket Insights',
        children: [
            {
                type: TicketFieldsChart,
                config: TicketFieldsConfig,
            },
            {
                type: TicketInsightsTagsChart,
                config: TicketInsightsTagsConfig,
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
        category: 'Busiest Times',
        children: [
            {
                type: BusiestTimesChart,
                config: BusiestTimesReportConfig,
            },
        ],
    },
    {
        category: 'Channel',
        children: [
            {
                type: ChannelsChart,
                config: ChannelsReportConfig,
            },
        ],
    },
]
