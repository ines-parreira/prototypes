import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import store from 'common/store/store'
import type { User } from 'config/types/user'
import type { ConfigurableGraphFetch } from 'domains/reporting/hooks/common/useConfigurableGraphsReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { EntityMetricConfig } from 'domains/reporting/hooks/useStatsMetricPerDimension'
import {
    assembleEntityRows,
    fetchEntityMetrics,
    useEntityMetrics,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    PERFORMANCE_OVERVIEW_AGENT_COLUMNS,
    PERFORMANCE_OVERVIEW_AGENT_TABLE,
} from 'domains/reporting/pages/performance/overview/charts/breakdownTables/PerformanceOverviewAgentTable/columns'
import type {
    PerformanceOverviewEntityMetrics,
    PerformanceOverviewMetricKey,
    PerformanceOverviewMetricsData,
} from 'domains/reporting/pages/performance/overview/config/breakdownTableMetrics'
import {
    buildPerformanceOverviewEntityRow,
    PERFORMANCE_OVERVIEW_METRIC_FACTORIES,
} from 'domains/reporting/pages/performance/overview/config/breakdownTableMetrics'
import { humanizeAgent } from 'domains/reporting/pages/performance/utils/humanizeAgent'
import {
    fetchMetricPerAgent,
    useMetricPerAgent,
} from 'domains/reporting/pages/performance/utils/useMetricPerAgent'
import { getFilteredAgents } from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import useAppSelector from 'hooks/useAppSelector'
import { createCsv } from 'utils/file'

const PERFORMANCE_OVERVIEW_AGENT_METRICS_CONFIG = Object.fromEntries(
    Object.entries(PERFORMANCE_OVERVIEW_METRIC_FACTORIES).map(
        ([key, factory]) => [
            key,
            {
                use: (filters: StatsFilters, timezone: string) =>
                    useMetricPerAgent(factory, filters, timezone),
                fetch: (filters: StatsFilters, timezone: string) =>
                    fetchMetricPerAgent(factory, filters, timezone),
            },
        ],
    ),
) as Record<PerformanceOverviewMetricKey, EntityMetricConfig>

const collectAgents = (agents: User[]): string[] => {
    const nameById = new Map(agents.map((a) => [String(a.id), a.name ?? '']))
    return agents
        .filter((agent) => agent.id != null)
        .map((agent) => String(agent.id))
        .sort((a, b) =>
            (nameById.get(a) ?? a).localeCompare(nameById.get(b) ?? b),
        )
}

export const usePerformanceOverviewAgentMetrics =
    (): PerformanceOverviewMetricsData => {
        const { cleanStatsFilters, userTimezone } = useStatsFilters()
        const agents = useAppSelector(getFilteredAgents)

        const {
            data: entityData,
            isLoading,
            isError,
            loadingStates,
        } = useEntityMetrics(
            PERFORMANCE_OVERVIEW_AGENT_METRICS_CONFIG,
            cleanStatsFilters,
            userTimezone,
        )

        const data = useMemo(() => {
            const ids = collectAgents(agents)
            return assembleEntityRows(
                ids,
                buildPerformanceOverviewEntityRow(entityData),
            )
        }, [entityData, agents])

        return { data, isLoading, isError, loadingStates }
    }

const PERFORMANCE_OVERVIEW_AGENT_FILENAME = 'performance-overview_by-agent'

export const fetchPerformanceOverviewAgentMetrics = async (
    statsFilters: StatsFilters,
    timezone: string,
    agents: User[],
): Promise<{ fileName: string; files: Record<string, string> }> => {
    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        PERFORMANCE_OVERVIEW_AGENT_FILENAME,
    )

    const metrics = await fetchEntityMetrics(
        PERFORMANCE_OVERVIEW_AGENT_METRICS_CONFIG,
        statsFilters,
        timezone,
    )

    const ids = collectAgents(agents)
    const rows = assembleEntityRows(
        ids,
        buildPerformanceOverviewEntityRow(metrics.data),
    )

    if (rows.length === 0) {
        return { fileName, files: { [fileName]: '' } }
    }

    const headers = [
        PERFORMANCE_OVERVIEW_AGENT_TABLE.title,
        ...PERFORMANCE_OVERVIEW_AGENT_COLUMNS.map((col) => col.label),
    ]
    const csvRows = rows.map((row) => [
        humanizeAgent(agents, row.entity),
        ...PERFORMANCE_OVERVIEW_AGENT_COLUMNS.map((col) =>
            formatMetricValue(
                row[
                    col.accessorKey as keyof PerformanceOverviewEntityMetrics
                ] as number,
                col.metricFormat,
            ),
        ),
    ])

    return { fileName, files: { [fileName]: createCsv([headers, ...csvRows]) } }
}

export const fetchPerformanceOverviewAgentAsConfigurableTable: ConfigurableGraphFetch =
    async (_savedMeasure, _savedDimension, filters, timezone) => {
        const agents = getFilteredAgents(store.getState())
        const { files } = await fetchPerformanceOverviewAgentMetrics(
            filters,
            timezone,
            agents,
        )
        return { files }
    }
