import {ReportsModalConfig} from 'pages/stats/custom-reports/types'
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
