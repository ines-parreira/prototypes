import { fetchAgentsTableReportData } from 'domains/reporting/hooks/support-performance/agents/useDownloadAgentsPerformanceData'
import type { StaticFilter } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { AUTO_QA_FILTER_KEYS } from 'domains/reporting/pages/common/filters/constants'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import {
    AgentsShoutOutsConfig,
    TopPerformersChart,
} from 'domains/reporting/pages/support-performance/agents/AgentsShoutOutsConfig'
import { AgentsTabbedChart } from 'domains/reporting/pages/support-performance/agents/AgentsTabbedChart'
import { SECTION_TITLES } from 'domains/reporting/pages/support-performance/agents/constants'
import { TopClosedTicketsPerformers } from 'domains/reporting/pages/support-performance/agents/TopClosedTicketsPerformers'
import { TopCsatPerformers } from 'domains/reporting/pages/support-performance/agents/TopCsatPerformers'
import { TopFirstResponseTimePerformers } from 'domains/reporting/pages/support-performance/agents/TopFirstResponseTimePerformers'
import { TopResponseTimePerformers } from 'domains/reporting/pages/support-performance/agents/TopResponseTimePerformers'
import { STATS_ROUTES } from 'routes/constants'

export const AGENT_PERSISTENT_FILTERS: StaticFilter[] = [FilterKey.Period]

export const AGENTS_OPTIONAL_FILTERS = [
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.Tags,
    FilterKey.Agents,
    FilterKey.AssignedTeam,
    FilterKey.CustomFields,
    FilterKey.Score,
    FilterKey.Stores,
    ...AUTO_QA_FILTER_KEYS,
]

export enum AgentsChart {
    Table = 'agents_table',
    TopCSATPerformers = 'agents_top_csat_performers',
    TopFirstResponseTimePerformers = 'agents_top_first_response_time_performers',
    TopResponseTimePerformers = 'agents_top_response_time_performers',
    TopClosedTicketsPerformers = 'agents_top_closed_tickets_performers',
}

export const SupportPerformanceAgentsReportConfig: ReportConfig<AgentsChart> = {
    id: ReportsIDs.SupportPerformanceAgentsReportConfig,
    reportName: SECTION_TITLES.AGENT_PERFORMANCE,
    reportPath: STATS_ROUTES.SUPPORT_PERFORMANCE_AGENTS,
    charts: {
        [AgentsChart.Table]: {
            chartComponent: AgentsTabbedChart,
            label: SECTION_TITLES.AGENT_PERFORMANCE,
            csvProducer: [
                {
                    type: DataExportFormat.Table,
                    fetch: fetchAgentsTableReportData,
                },
            ],
            description:
                'Selected metrics broken by agent (e.g Closed tickets, CSAT, FRT, Ticket Handle Time...)',
            chartType: ChartType.Table,
        },
        [AgentsChart.TopCSATPerformers]: {
            chartComponent: TopCsatPerformers,
            label: AgentsShoutOutsConfig[TopPerformersChart.TopCSATPerformers]
                .title,
            description:
                AgentsShoutOutsConfig[TopPerformersChart.TopCSATPerformers].hint
                    .title,
            csvProducer: null,
            chartType: ChartType.Card,
        },
        [AgentsChart.TopFirstResponseTimePerformers]: {
            chartComponent: TopFirstResponseTimePerformers,
            label: AgentsShoutOutsConfig[
                TopPerformersChart.TopFirstResponseTimePerformers
            ].title,
            description:
                AgentsShoutOutsConfig[
                    TopPerformersChart.TopFirstResponseTimePerformers
                ].hint.title,
            csvProducer: null,
            chartType: ChartType.Card,
        },
        [AgentsChart.TopResponseTimePerformers]: {
            chartComponent: TopResponseTimePerformers,
            label: AgentsShoutOutsConfig[
                TopPerformersChart.TopResponseTimePerformers
            ].title,
            description:
                AgentsShoutOutsConfig[
                    TopPerformersChart.TopResponseTimePerformers
                ].hint.title,
            csvProducer: null,
            chartType: ChartType.Card,
        },
        [AgentsChart.TopClosedTicketsPerformers]: {
            chartComponent: TopClosedTicketsPerformers,
            label: AgentsShoutOutsConfig[
                TopPerformersChart.TopClosedTicketsPerformers
            ].title,
            description:
                AgentsShoutOutsConfig[
                    TopPerformersChart.TopClosedTicketsPerformers
                ].hint.title,
            csvProducer: null,
            chartType: ChartType.Card,
        },
    },
    reportFilters: {
        persistent: AGENT_PERSISTENT_FILTERS,
        optional: AGENTS_OPTIONAL_FILTERS,
    },
}
