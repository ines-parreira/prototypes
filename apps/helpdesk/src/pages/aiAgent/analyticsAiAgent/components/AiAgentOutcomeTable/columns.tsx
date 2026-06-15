import type { MetricColumnConfig, NameColumnConfig } from '@repo/reporting'

import { formatAiAgentOutcome } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentOutcomeTable/constants'

export const AI_AGENT_OUTCOME_NAME_COLUMNS: NameColumnConfig[] = [
    {
        accessor: 'entity',
        label: 'AI Agent outcome',
        formatName: formatAiAgentOutcome,
    },
]

export const AI_AGENT_OUTCOME_COLUMNS: MetricColumnConfig[] = [
    {
        accessorKey: 'allAgents',
        label: 'All AI Agents',
        metricFormat: 'decimal',
        loadingStateKeys: ['ticketCount'],
    },
    {
        accessorKey: 'supportAgent',
        label: 'AI Support Agent',
        metricFormat: 'decimal',
        loadingStateKeys: ['ticketCount'],
    },
    {
        accessorKey: 'shoppingAssistant',
        label: 'AI Shopping assistant',
        metricFormat: 'decimal',
        loadingStateKeys: ['ticketCount'],
    },
]
