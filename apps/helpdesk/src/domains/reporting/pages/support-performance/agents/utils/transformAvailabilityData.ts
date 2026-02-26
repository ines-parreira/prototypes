import type { CustomUserAvailabilityStatus } from '@gorgias/helpdesk-types'

import type { User } from 'config/types/user'
import type {
    AgentAvailabilityColumn,
    AgentNameColumnKey,
} from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import { getCustomUnavailabilityStatusColumnKey } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import { AGENT_AVAILABILITY_COLUMNS } from 'domains/reporting/pages/support-performance/agents/constants'

const { ONLINE_TIME_COLUMN } = AGENT_AVAILABILITY_COLUMNS

type BaseAgentAvailabilityData = {
    id: number
    name: string
    email: string
    avatarUrl?: string
}

export type StatusBreakdown = {
    total: number
    online: number
    offline: number
}

// Metric columns only (exclude agent_name which is not a metric)
type AgentAvailabilityMetricColumn = Exclude<
    AgentAvailabilityColumn,
    AgentNameColumnKey
>

export type AgentAvailabilityData = BaseAgentAvailabilityData & {
    [key: string]: number | string | StatusBreakdown | undefined
}

type DimensionData = Array<{ dimension: string | number; value: number | null }>

export type StatusDimensionData = Array<{
    agentId: string | number
    statusName: string | number
    totalDurationSeconds: string | number | null
    onlineDurationSeconds: string | number | null
    offlineDurationSeconds: string | number | null
}>

export const transformAvailabilityData = (
    onlineTimeData: DimensionData,
    perStatusData: StatusDimensionData,
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

    // Add status breakdowns with total, online, offline for each status
    perStatusData.forEach(
        ({
            agentId,
            statusName,
            totalDurationSeconds,
            onlineDurationSeconds,
            offlineDurationSeconds,
        }) => {
            if (!agentId || !statusName) return

            const agentIdStr = String(agentId)
            const statusNameStr = String(statusName)
            const agentData = agentDataMap.get(agentIdStr)

            if (agentData) {
                const normalizedStatusName = statusNameStr.toLowerCase()

                // Create breakdown object (API returns strings, convert to numbers)
                const breakdown: StatusBreakdown = {
                    total: Number(totalDurationSeconds) || 0,
                    online: Number(onlineDurationSeconds) || 0,
                    offline: Number(offlineDurationSeconds) || 0,
                }

                // Check if it's a custom status first (has an ID mapping)
                const customStatusId =
                    customStatusNameToId.get(normalizedStatusName)
                if (customStatusId) {
                    // Custom status - use the custom ID in column key
                    const columnKey = getCustomUnavailabilityStatusColumnKey(
                        customStatusId,
                    ) as AgentAvailabilityMetricColumn
                    agentData[columnKey] = breakdown
                } else {
                    // System status - column key is simply "agent_status_{statusName}"
                    const columnKey =
                        `agent_status_${normalizedStatusName}` as AgentAvailabilityMetricColumn
                    agentData[columnKey] = breakdown
                }
            }
        },
    )

    return [...agentDataMap.values()]
}
