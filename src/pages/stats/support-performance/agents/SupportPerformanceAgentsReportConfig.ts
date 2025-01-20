import {FilterKey, StaticFilter} from 'models/stat/types'
import {ChartType, ReportConfig} from 'pages/stats/custom-reports/types'
import {
    AGENT_PERFORMANCE_SECTION_TITLE,
    AgentsTableChart,
} from 'pages/stats/support-performance/agents/AgentsTableChart'
import {TopClosedTicketsPerformers} from 'pages/stats/support-performance/agents/TopClosedTicketsPerformers'
import {TopCsatPerformers} from 'pages/stats/support-performance/agents/TopCsatPerformers'
import {TopFirstResponseTimePerformers} from 'pages/stats/support-performance/agents/TopFirstResponseTimePerformers'
import {TopResponseTimePerformers} from 'pages/stats/support-performance/agents/TopResponseTimePerformers'

export const AGENT_PERSISTENT_FILTERS: StaticFilter[] = [FilterKey.Period]

export const AGENTS_OPTIONAL_FILTERS = [
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.Tags,
    FilterKey.Agents,
    FilterKey.CustomFields,
]

export enum AgentsChart {
    Table = 'agents_table',
    TopCSATPerformers = 'agents_top_csat_performers',
    TopFirstResponseTimePerformers = 'agents_top_first_response_time_performers',
    TopResponseTimePerformers = 'agents_top_response_time_performers',
    TopClosedTicketsPerformers = 'agents_top_closed_tickets_performers',
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
            chartType: ChartType.Table,
        },
        [AgentsChart.TopCSATPerformers]: {
            chartComponent: TopCsatPerformers,
            label: '',
            csvProducer: null,
            description: '',
            chartType: ChartType.Card,
        },
        [AgentsChart.TopFirstResponseTimePerformers]: {
            chartComponent: TopFirstResponseTimePerformers,
            label: '',
            csvProducer: null,
            description: '',
            chartType: ChartType.Card,
        },
        [AgentsChart.TopResponseTimePerformers]: {
            chartComponent: TopResponseTimePerformers,
            label: '',
            csvProducer: null,
            description: '',
            chartType: ChartType.Card,
        },
        [AgentsChart.TopClosedTicketsPerformers]: {
            chartComponent: TopClosedTicketsPerformers,
            label: '',
            csvProducer: null,
            description: '',
            chartType: ChartType.Card,
        },
    },
    reportFilters: {
        persistent: AGENT_PERSISTENT_FILTERS,
        optional: AGENTS_OPTIONAL_FILTERS,
    },
}
