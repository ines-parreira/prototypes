import type { ReportingMetricItem } from 'domains/reporting/hooks/types'
import { getColumnValue } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableCell'
import type { AgentAvailabilityData } from 'domains/reporting/pages/support-performance/agents/utils'
import type { StatusBreakdown } from 'domains/reporting/pages/support-performance/agents/utils/transformAvailabilityData'
import { OrderDirection } from 'models/api/types'

type AgentAvailabilitySorting = {
    field: string
    direction: OrderDirection
    lastSortingMetric?: ReportingMetricItem[] | null
}

export function sortAgentAvailability(
    agents: AgentAvailabilityData[],
    sorting: AgentAvailabilitySorting | undefined | null,
): AgentAvailabilityData[] {
    if (!sorting?.field || !agents.length) {
        return agents
    }

    if (sorting.field === 'agent_online_time' && sorting.lastSortingMetric) {
        const sortedIds = sorting.lastSortingMetric.map((item) =>
            Number(item.agentId),
        )

        return [...agents].sort((a, b) => {
            const aIndex = sortedIds.indexOf(a.id)
            const bIndex = sortedIds.indexOf(b.id)
            if (aIndex === -1) return 1
            if (bIndex === -1) return -1
            return aIndex - bIndex
        })
    }

    return [...agents].sort((a, b) => {
        const aField = a[sorting.field] as number | StatusBreakdown | undefined
        const bField = b[sorting.field] as number | StatusBreakdown | undefined

        const aValue = getColumnValue(aField) ?? 0
        const bValue = getColumnValue(bField) ?? 0

        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        return sorting.direction === OrderDirection.Desc
            ? -comparison
            : comparison
    })
}
