import {FilterKey} from 'models/stat/types'
import {CHARTS_MODAL_ICONS} from 'pages/stats/custom-reports/CustomReportsModal/ChartIcon'
import {ReportConfig} from 'pages/stats/custom-reports/types'
import {AGENTS_SHOUT_OUTS_TITLE} from 'pages/stats/support-performance/agents/AgentsShoutout'
import AgentsShoutOuts from 'pages/stats/support-performance/agents/AgentsShoutouts'
import {
    AGENT_PERFORMANCE_SECTION_TITLE,
    AgentsTableChart,
} from 'pages/stats/support-performance/agents/AgentsTableChart'

export const AGENTS_OPTIONAL_FILTERS = [
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.Tags,
    FilterKey.Agents,
    FilterKey.CustomFields,
]

export enum AgentsChart {
    Table = 'agents_table',
    TopPerformers = 'agents_top_performers',
}

export const SupportPerformanceAgentsReportConfig: ReportConfig<AgentsChart> = {
    reportName: AGENT_PERFORMANCE_SECTION_TITLE,
    reportPath: 'support-performance-agents',
    charts: {
        [AgentsChart.Table]: {
            chartComponent: AgentsTableChart,
            label: AGENT_PERFORMANCE_SECTION_TITLE,
            csvProducer: null,
            description:
                'Selected metrics broken by agent (e.g Closed tickets, CSAT, FRT, Ticket Handle Time...)',
            icon: CHARTS_MODAL_ICONS.table,
        },
        [AgentsChart.TopPerformers]: {
            chartComponent: AgentsShoutOuts,
            label: AGENTS_SHOUT_OUTS_TITLE,
            csvProducer: null,
            description: '',
            icon: CHARTS_MODAL_ICONS.card,
        },
    },
    reportFilters: {
        persistent: [FilterKey.Period],
        optional: AGENTS_OPTIONAL_FILTERS,
    },
}
