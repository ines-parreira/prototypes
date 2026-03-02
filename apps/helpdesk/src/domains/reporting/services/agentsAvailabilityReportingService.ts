import { formatMetricValue } from '@repo/reporting'

import type { CustomUserAvailabilityStatus } from '@gorgias/helpdesk-queries'

import {
    AGENT_AVAILABILITY_COLUMNS,
    AGENT_AVAILABILITY_TABLE_LABELS,
} from 'domains/reporting/pages/support-performance/agents/constants'
import type { AgentAvailabilityData } from 'domains/reporting/pages/support-performance/agents/utils'
import { createCsv } from 'utils/file'

export const SUMMARY_ROW_AGENT_COLUMN_LABEL = 'Average'
export const TOTAL_ROW_AGENT_COLUMN_LABEL = 'Total'

const {
    ONLINE_TIME_COLUMN,
    AVAILABLE_STATUS_COLUMN,
    UNAVAILABLE_STATUS_COLUMN,
    ON_CALL_STATUS_COLUMN,
    WRAPPING_UP_STATUS_COLUMN,
} = AGENT_AVAILABILITY_COLUMNS

const formatMs = (ms: number | null | undefined): string => {
    return formatMetricValue(ms, 'duration', undefined, true)
}

const systemStatusColumns = [
    {
        key: AVAILABLE_STATUS_COLUMN,
        label: AGENT_AVAILABILITY_TABLE_LABELS[AVAILABLE_STATUS_COLUMN],
    },
    {
        key: UNAVAILABLE_STATUS_COLUMN,
        label: AGENT_AVAILABILITY_TABLE_LABELS[UNAVAILABLE_STATUS_COLUMN],
    },
    {
        key: ON_CALL_STATUS_COLUMN,
        label: AGENT_AVAILABILITY_TABLE_LABELS[ON_CALL_STATUS_COLUMN],
    },
    {
        key: WRAPPING_UP_STATUS_COLUMN,
        label: AGENT_AVAILABILITY_TABLE_LABELS[WRAPPING_UP_STATUS_COLUMN],
    },
] as const

export const createAgentsAvailabilityReport = (
    agents: AgentAvailabilityData[],
    customStatuses: CustomUserAvailabilityStatus[],
    fileName: string,
) => {
    if (!agents.length) {
        return {
            files: {
                [fileName]: createCsv([['No data available']]),
            },
        }
    }

    const statusColumns: Array<{ key: string; label: string }> = [
        ...systemStatusColumns,
    ]

    customStatuses.forEach((status) => {
        const columnKey = `agent_status_${status.id}`
        statusColumns.push({ key: columnKey, label: status.name })
    })

    const headers = [
        'Agent Name',
        'Online Time',
        ...statusColumns.map((col) => col.label),
    ]

    let totalOnlineTime = 0
    const statusTotals: Record<string, number> = {}

    agents.forEach((agent) => {
        const onlineTime = Number(agent[ONLINE_TIME_COLUMN]) || 0
        totalOnlineTime += onlineTime

        statusColumns.forEach(({ key }) => {
            const value = agent[key]
            // Handle both number and StatusBreakdown object
            const total =
                typeof value === 'object' && value && 'total' in value
                    ? value.total
                    : Number(value) || 0

            statusTotals[key] = (statusTotals[key] || 0) + total
        })
    })

    const avgOnlineTime = totalOnlineTime / agents.length
    const statusAverages: Record<string, number> = {}
    statusColumns.forEach(({ key }) => {
        statusAverages[key] = (statusTotals[key] || 0) / agents.length
    })

    const rows: string[][] = []

    rows.push([
        TOTAL_ROW_AGENT_COLUMN_LABEL,
        formatMs(totalOnlineTime),
        ...statusColumns.map(({ key }) => formatMs(statusTotals[key])),
    ])

    rows.push([
        SUMMARY_ROW_AGENT_COLUMN_LABEL,
        formatMs(avgOnlineTime),
        ...statusColumns.map(({ key }) => formatMs(statusAverages[key])),
    ])

    agents.forEach((agent) => {
        const onlineTime = Number(agent[ONLINE_TIME_COLUMN]) || 0

        const statusValues = statusColumns.map(({ key }) => {
            const value = agent[key]
            const total =
                typeof value === 'object' && 'total' in value
                    ? value.total
                    : Number(value) || 0
            return formatMs(total)
        })

        rows.push([agent.name, formatMs(onlineTime), ...statusValues])
    })

    const csv = createCsv([headers, ...rows])

    return {
        files: {
            [fileName]: csv,
        },
    }
}
