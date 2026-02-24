import type { CustomUserAvailabilityStatus } from '@gorgias/helpdesk-types'

import type { User } from 'config/types/user'
import type {
    AgentAvailabilityColumn,
    AgentNameColumnKey,
} from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import { getCustomUnavailabilityStatusColumnKey } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import {
    AGENT_AVAILABILITY_COLUMNS,
    fixedAgentAvailabilityColumnsInitialData,
} from 'domains/reporting/pages/support-performance/agents/constants'

const { ONLINE_TIME_COLUMN } = AGENT_AVAILABILITY_COLUMNS

type BaseAgentAvailabilityData = {
    id: number
    name: string
    email: string
    avatarUrl?: string
}

// Metric columns only (exclude agent_name which is not a metric)
type AgentAvailabilityMetricColumn = Exclude<
    AgentAvailabilityColumn,
    AgentNameColumnKey
>

type AgentAvailabilityColumnData = Record<AgentAvailabilityMetricColumn, number>

export type AgentAvailabilityData = BaseAgentAvailabilityData &
    Partial<AgentAvailabilityColumnData>

type DimensionData = Array<{ dimension: string | number; value: number | null }>

export const transformAvailabilityData = (
    onlineTimeData: DimensionData,
    perStatusData: DimensionData,
    agents: User[],
    customStatuses: CustomUserAvailabilityStatus[],
): AgentAvailabilityData[] => {
    const agentDataMap = new Map<string, AgentAvailabilityData>()

    // Create a map of custom status names to IDs for lookup (case-insensitive)
    const customStatusNameToId = new Map<string, string>()
    customStatuses.forEach((status) => {
        // Use lowercase keys for case-insensitive matching
        customStatusNameToId.set(status.name.toLowerCase(), status.id)
    })

    // Initialize ALL agents first (show agents even without data)
    agents.forEach((agent) => {
        agentDataMap.set(agent.id.toString(), {
            id: agent.id,
            name: agent.name,
            email: agent.email,
            avatarUrl: agent.meta?.profile_picture_url || undefined,
            ...fixedAgentAvailabilityColumnsInitialData,
        })
    })

    // Update with online totals - dimension is agentId
    onlineTimeData.forEach(({ dimension, value }) => {
        if (!dimension || value === null) return
        const agentId = String(dimension)
        const agentData = agentDataMap.get(agentId)
        if (agentData) {
            agentData[ONLINE_TIME_COLUMN] = value
        }
    })

    // Add status breakdowns - dimension format: "agentId,statusName"
    perStatusData.forEach(({ dimension, value }) => {
        if (!dimension || value === null) return
        const [agentId, statusName] = String(dimension).split(',')
        const agentData = agentDataMap.get(agentId)
        if (agentData && statusName) {
            const normalizedStatusName = statusName.toLowerCase()

            // Check if it's a custom status first (has an ID mapping)
            const customStatusId =
                customStatusNameToId.get(normalizedStatusName)
            if (customStatusId) {
                // Custom status - use the custom ID in column key
                const columnKey = getCustomUnavailabilityStatusColumnKey(
                    customStatusId,
                ) as AgentAvailabilityMetricColumn
                agentData[columnKey] = value
            } else {
                // System status - column key is simply "agent_status_{statusName}"
                // This works because we aligned column keys with API names
                const columnKey =
                    `agent_status_${normalizedStatusName}` as AgentAvailabilityMetricColumn
                agentData[columnKey] = value
            }
        }
    })

    return [...agentDataMap.values()]
}
