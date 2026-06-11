import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import { DefaultExportStore as store } from 'common/store/store'
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
    CHANNELS_EMAIL_AGENT_COLUMNS,
    CHANNELS_EMAIL_AGENT_TABLE,
} from 'domains/reporting/pages/performance/channels/email/charts/breakdownTables/ChannelsEmailAgentTable/columns'
import type {
    ChannelsEmailEntityMetrics,
    ChannelsEmailMetricKey,
    ChannelsEmailMetricsData,
} from 'domains/reporting/pages/performance/channels/email/config/breakdownTableMetrics'
import {
    buildChannelsEmailEntityRow,
    CHANNELS_EMAIL_METRIC_FACTORIES,
} from 'domains/reporting/pages/performance/channels/email/config/breakdownTableMetrics'
import { humanizeAgent } from 'domains/reporting/pages/performance/utils/humanizeAgent'
import {
    fetchMetricPerAgent,
    useMetricPerAgent,
} from 'domains/reporting/pages/performance/utils/useMetricPerAgent'
import { getFilteredAgents } from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import { useAppSelector } from 'hooks/useAppSelector'
import { createCsv } from 'utils/file'

const CHANNELS_EMAIL_AGENT_METRICS_CONFIG = Object.fromEntries(
    Object.entries(CHANNELS_EMAIL_METRIC_FACTORIES).map(([key, factory]) => [
        key,
        {
            use: (filters: StatsFilters, timezone: string) =>
                useMetricPerAgent(factory, filters, timezone),
            fetch: (filters: StatsFilters, timezone: string) =>
                fetchMetricPerAgent(factory, filters, timezone),
        },
    ]),
) as Record<ChannelsEmailMetricKey, EntityMetricConfig>

const collectAgents = (agents: User[]): string[] => {
    const nameById = new Map(agents.map((a) => [String(a.id), a.name ?? '']))
    return agents
        .filter((agent) => agent.id != null)
        .map((agent) => String(agent.id))
        .sort((a, b) =>
            (nameById.get(a) ?? a).localeCompare(nameById.get(b) ?? b),
        )
}

export const usePerformanceChannelsEmailAgentMetrics =
    (): ChannelsEmailMetricsData => {
        const { cleanStatsFilters, userTimezone } = useStatsFilters()
        const agents = useAppSelector(getFilteredAgents)

        const {
            data: entityData,
            isLoading,
            isError,
            loadingStates,
        } = useEntityMetrics(
            CHANNELS_EMAIL_AGENT_METRICS_CONFIG,
            cleanStatsFilters,
            userTimezone,
        )

        const data = useMemo(() => {
            const ids = collectAgents(agents)
            return assembleEntityRows(
                ids,
                buildChannelsEmailEntityRow(entityData),
            )
        }, [entityData, agents])

        return { data, isLoading, isError, loadingStates }
    }

const CHANNELS_EMAIL_AGENT_FILENAME = 'performance-channels-email_by-agent'

export const fetchPerformanceChannelsEmailAgentMetrics = async (
    statsFilters: StatsFilters,
    timezone: string,
    agents: User[],
): Promise<{ fileName: string; files: Record<string, string> }> => {
    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        CHANNELS_EMAIL_AGENT_FILENAME,
    )

    const metrics = await fetchEntityMetrics(
        CHANNELS_EMAIL_AGENT_METRICS_CONFIG,
        statsFilters,
        timezone,
    )

    const ids = collectAgents(agents)
    const rows = assembleEntityRows(
        ids,
        buildChannelsEmailEntityRow(metrics.data),
    )

    if (rows.length === 0) {
        return { fileName, files: { [fileName]: '' } }
    }

    const headers = [
        CHANNELS_EMAIL_AGENT_TABLE.title,
        ...CHANNELS_EMAIL_AGENT_COLUMNS.map((col) => col.label),
    ]
    const csvRows = rows.map((row) => [
        humanizeAgent(agents, row.entity),
        ...CHANNELS_EMAIL_AGENT_COLUMNS.map((col) =>
            formatMetricValue(
                row[
                    col.accessorKey as keyof ChannelsEmailEntityMetrics
                ] as number,
                col.metricFormat,
            ),
        ),
    ])

    return { fileName, files: { [fileName]: createCsv([headers, ...csvRows]) } }
}

export const fetchPerformanceChannelsEmailAgentAsConfigurableTable: ConfigurableGraphFetch =
    async (_savedMeasure, _savedDimension, filters, timezone) => {
        const agents = getFilteredAgents(store.getState())
        const { files } = await fetchPerformanceChannelsEmailAgentMetrics(
            filters,
            timezone,
            agents,
        )
        return { files }
    }
