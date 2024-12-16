import {ReportConfig} from 'pages/stats/common/CustomReport/types'

import {AGENTS_SHOUT_OUTS_TITLE} from 'pages/stats/support-performance/agents/AgentsShoutout'

import AgentsShoutOuts from 'pages/stats/support-performance/agents/AgentsShoutouts'
import {
    AGENT_PERFORMANCE_SECTION_TITLE,
    AgentsTableChart,
} from 'pages/stats/support-performance/agents/AgentsTableChart'

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
        },
        [AgentsChart.TopPerformers]: {
            chartComponent: AgentsShoutOuts,
            label: AGENTS_SHOUT_OUTS_TITLE,
            csvProducer: null,
        },
    },
}
