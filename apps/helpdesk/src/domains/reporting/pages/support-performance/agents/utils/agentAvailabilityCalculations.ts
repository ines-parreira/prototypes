import type { AgentAvailabilityColumn } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import { AGENT_AVAILABILITY_COLUMNS } from 'domains/reporting/pages/support-performance/agents/constants'

const { AGENT_NAME_COLUMN } = AGENT_AVAILABILITY_COLUMNS
type AgentAvailabilityData = {
    id: number
    name: string
    [key: string]: number | string | undefined
}

/**
 * Calculates the total sum of values for a given column across all agents.
 * Returns 0 for non-numeric values and for the agent name column.
 */
export const calculateTotal = (
    agents: AgentAvailabilityData[],
    column: AgentAvailabilityColumn,
): number => {
    if (column === AGENT_NAME_COLUMN) return 0
    return agents.reduce((sum, agent) => {
        const value = agent[column]
        return sum + (typeof value === 'number' ? value : 0)
    }, 0)
}

/**
 * Calculates the average value for a given column across all agents.
 * Returns 0 for empty agent arrays and for the agent name column.
 */
export const calculateAverage = (
    agents: AgentAvailabilityData[],
    column: AgentAvailabilityColumn,
): number => {
    if (agents.length === 0 || column === AGENT_NAME_COLUMN) return 0
    return calculateTotal(agents, column) / agents.length
}
