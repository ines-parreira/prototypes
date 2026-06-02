import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

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
    PERFORMANCE_OVERVIEW_CHANNEL_COLUMNS,
    PERFORMANCE_OVERVIEW_CHANNEL_TABLE,
} from 'domains/reporting/pages/performance/overview/charts/breakdownTables/PerformanceOverviewChannelTable/columns'
import type {
    PerformanceOverviewEntityMetrics,
    PerformanceOverviewMetricKey,
    PerformanceOverviewMetricsData,
} from 'domains/reporting/pages/performance/overview/config/breakdownTableMetrics'
import {
    buildPerformanceOverviewEntityRow,
    hasAnyMetricValue,
    PERFORMANCE_OVERVIEW_METRIC_FACTORIES,
} from 'domains/reporting/pages/performance/overview/config/breakdownTableMetrics'
import {
    fetchMetricPerChannel,
    useMetricPerChannel,
} from 'domains/reporting/pages/performance/utils/useMetricPerChannel'
import { humanizeChannel } from 'state/ticket/utils'
import { createCsv } from 'utils/file'

const PERFORMANCE_OVERVIEW_CHANNEL_METRICS_CONFIG = Object.fromEntries(
    Object.entries(PERFORMANCE_OVERVIEW_METRIC_FACTORIES).map(
        ([key, factory]) => [
            key,
            {
                use: (filters: StatsFilters, timezone: string) =>
                    useMetricPerChannel(factory, filters, timezone),
                fetch: (filters: StatsFilters, timezone: string) =>
                    fetchMetricPerChannel(factory, filters, timezone),
            },
        ],
    ),
) as Record<PerformanceOverviewMetricKey, EntityMetricConfig>

const collectChannels = (
    entityData: Record<
        PerformanceOverviewMetricKey,
        Partial<Record<string, number | null | undefined>>
    >,
): string[] => {
    const channels = new Set<string>()
    for (const metric of Object.values(entityData)) {
        for (const channel of Object.keys(metric)) {
            channels.add(channel)
        }
    }
    return Array.from(channels).sort((a, b) =>
        humanizeChannel(a).localeCompare(humanizeChannel(b)),
    )
}

export const usePerformanceOverviewChannelMetrics =
    (): PerformanceOverviewMetricsData => {
        const { cleanStatsFilters, userTimezone } = useStatsFilters()

        const {
            data: entityData,
            isLoading,
            isError,
            loadingStates,
        } = useEntityMetrics(
            PERFORMANCE_OVERVIEW_CHANNEL_METRICS_CONFIG,
            cleanStatsFilters,
            userTimezone,
        )

        const data = useMemo(() => {
            const channels = collectChannels(entityData)
            const rows = assembleEntityRows(
                channels,
                buildPerformanceOverviewEntityRow(entityData),
            )
            return rows.filter(hasAnyMetricValue)
        }, [entityData])

        return { data, isLoading, isError, loadingStates }
    }

const PERFORMANCE_OVERVIEW_CHANNEL_FILENAME = 'performance-overview_by-channel'

export const fetchPerformanceOverviewChannelMetrics = async (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<{ fileName: string; files: Record<string, string> }> => {
    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        PERFORMANCE_OVERVIEW_CHANNEL_FILENAME,
    )

    const metrics = await fetchEntityMetrics(
        PERFORMANCE_OVERVIEW_CHANNEL_METRICS_CONFIG,
        statsFilters,
        timezone,
    )

    const channels = collectChannels(metrics.data)
    const rows = assembleEntityRows(
        channels,
        buildPerformanceOverviewEntityRow(metrics.data),
    ).filter(hasAnyMetricValue)

    if (rows.length === 0) {
        return { fileName, files: { [fileName]: '' } }
    }

    const headers = [
        PERFORMANCE_OVERVIEW_CHANNEL_TABLE.title,
        ...PERFORMANCE_OVERVIEW_CHANNEL_COLUMNS.map((col) => col.label),
    ]
    const csvRows = rows.map((row) => [
        humanizeChannel(row.entity),
        ...PERFORMANCE_OVERVIEW_CHANNEL_COLUMNS.map((col) =>
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

export const fetchPerformanceOverviewChannelAsConfigurableTable: ConfigurableGraphFetch =
    async (_savedMeasure, _savedDimension, filters, timezone) => {
        const { files } = await fetchPerformanceOverviewChannelMetrics(
            filters,
            timezone,
        )
        return { files }
    }
