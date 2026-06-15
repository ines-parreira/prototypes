import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import type { ConfigurableGraphFetch } from 'domains/reporting/hooks/common/useConfigurableGraphsReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { buildAiAgentOutcomeBreakdownQuery } from 'domains/reporting/models/queryFactories/ai-agent-insights/aiAgentOutcomeQueryFactories'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    AI_AGENT_OUTCOME_COLUMNS,
    AI_AGENT_OUTCOME_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsAiAgent/components/AiAgentOutcomeTable/columns'
import {
    AI_AGENT_OUTCOME_CODES,
    AI_AGENT_OUTCOME_TABLE,
    AI_AGENT_ROLE,
    formatAiAgentOutcome,
} from 'pages/aiAgent/analyticsAiAgent/components/AiAgentOutcomeTable/constants'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { createCsv } from 'utils/file'

export type AiAgentOutcomeEntityMetrics = {
    entity: string
    allAgents: number | null
    supportAgent: number | null
    shoppingAssistant: number | null
}

export type AiAgentOutcomeMetricsData = {
    data: AiAgentOutcomeEntityMetrics[]
    isLoading: boolean
    isError: boolean
    loadingStates: { ticketCount: boolean }
}

const outcomeRoleKey = (outcome: string, role: string) => `${outcome}__${role}`

const pivotOutcomeRows = (
    allData: Record<string, string | number | null>[],
): AiAgentOutcomeEntityMetrics[] => {
    const ticketCountByOutcomeAndRole = new Map<string, number>()

    allData.forEach((row) => {
        const outcome = row['aiOutcomeCustomField']
        const role = row['aiAgentRole']
        const count = row['ticketCount'] as number | null
        if (outcome == null || role == null || count === null) {
            return
        }
        const key = outcomeRoleKey(String(outcome), String(role))
        ticketCountByOutcomeAndRole.set(
            key,
            (ticketCountByOutcomeAndRole.get(key) ?? 0) + count,
        )
    })

    return AI_AGENT_OUTCOME_CODES.map((outcome) => {
        const supportAgent =
            ticketCountByOutcomeAndRole.get(
                outcomeRoleKey(outcome, AI_AGENT_ROLE.support),
            ) ?? null
        const shoppingAssistant =
            ticketCountByOutcomeAndRole.get(
                outcomeRoleKey(outcome, AI_AGENT_ROLE.shopping),
            ) ?? null
        const allAgents =
            supportAgent === null && shoppingAssistant === null
                ? null
                : (supportAgent ?? 0) + (shoppingAssistant ?? 0)

        return { entity: outcome, allAgents, supportAgent, shoppingAssistant }
    })
}

export const useAiAgentOutcomeMetrics = (): AiAgentOutcomeMetricsData => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()

    const query = buildAiAgentOutcomeBreakdownQuery(statsFilters, userTimezone)

    const { data, isFetching, isError } = useStatsMetricPerDimension(query)

    const rows = useMemo(() => pivotOutcomeRows(data?.allData ?? []), [data])

    return {
        data: rows,
        isLoading: isFetching,
        isError,
        loadingStates: { ticketCount: isFetching },
    }
}

const AI_AGENT_OUTCOME_FILENAME = `${AI_AGENT_OUTCOME_TABLE.title.toLowerCase().replace(/\s+/g, '_')}_table`

export const fetchAiAgentOutcomeMetrics = async (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<{ fileName: string; files: Record<string, string> }> => {
    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        AI_AGENT_OUTCOME_FILENAME,
    )

    const query = buildAiAgentOutcomeBreakdownQuery(statsFilters, timezone)

    const { data } = await fetchStatsMetricPerDimension(query)
    const rows = pivotOutcomeRows(data?.allData ?? [])

    const headers = [
        AI_AGENT_OUTCOME_NAME_COLUMNS[0]?.label ?? AI_AGENT_OUTCOME_TABLE.title,
        ...AI_AGENT_OUTCOME_COLUMNS.map((col) => col.label),
    ]
    const csvRows = rows.map((row) => [
        formatAiAgentOutcome(row.entity),
        ...AI_AGENT_OUTCOME_COLUMNS.map((col) =>
            formatMetricValue(
                row[
                    col.accessorKey as keyof AiAgentOutcomeEntityMetrics
                ] as number,
                col.metricFormat,
            ),
        ),
    ])

    return { fileName, files: { [fileName]: createCsv([headers, ...csvRows]) } }
}

export const fetchAiAgentOutcomeAsConfigurableTable: ConfigurableGraphFetch =
    async (_savedMeasure, _savedDimension, filters, timezone) => {
        const { files } = await fetchAiAgentOutcomeMetrics(filters, timezone)
        return { files }
    }
