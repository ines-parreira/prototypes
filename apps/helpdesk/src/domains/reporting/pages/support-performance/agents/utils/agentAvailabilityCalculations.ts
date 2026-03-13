import type { AgentAvailabilityColumn } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import { AGENT_AVAILABILITY_COLUMNS } from 'domains/reporting/pages/support-performance/agents/constants'
import type { StatusBreakdown } from 'domains/reporting/pages/support-performance/agents/utils/transformAvailabilityData'

const { AGENT_NAME_COLUMN, AVAILABLE_STATUS_COLUMN } =
    AGENT_AVAILABILITY_COLUMNS
type AgentAvailabilityData = {
    id: number
    name: string
    [key: string]: number | string | StatusBreakdown | undefined
}

// Extract numeric value from column data
// Online time column is a number, status columns are StatusBreakdown objects
// For Available column, use only online time (not total which includes offline)
function getNumericValue(
    value: number | string | StatusBreakdown | undefined,
    column?: AgentAvailabilityColumn,
): number {
    if (value == null) return 0
    if (typeof value === 'number') return value
    if (typeof value === 'object' && 'total' in value) {
        if (column === AVAILABLE_STATUS_COLUMN) {
            return value.online
        }
        return value.total
    }
    return 0
}

/**
 * Calculates the total sum of values for a given column across all agents.
 * Returns 0 for non-numeric values and for the agent name column.
 * For status columns, uses the .total property from StatusBreakdown objects,
 * except for Available column which uses .online only.
 */
export const calculateTotal = (
    agents: AgentAvailabilityData[],
    column: AgentAvailabilityColumn,
): number => {
    if (column === AGENT_NAME_COLUMN) return 0
    return agents.reduce((sum, agent) => {
        const value = agent[column]
        return sum + getNumericValue(value, column)
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
