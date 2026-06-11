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
import { EMAIL_AND_CONTACT_FORM_CHANNELS } from 'domains/reporting/models/scopes/channelFilter'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    CHANNELS_EMAIL_SUB_CHANNEL_COLUMNS,
    CHANNELS_EMAIL_SUB_CHANNEL_TABLE,
} from 'domains/reporting/pages/performance/channels/email/charts/breakdownTables/ChannelsEmailSubChannelTable/columns'
import type {
    ChannelsEmailEntityMetrics,
    ChannelsEmailMetricKey,
    ChannelsEmailMetricsData,
} from 'domains/reporting/pages/performance/channels/email/config/breakdownTableMetrics'
import {
    buildChannelsEmailEntityRow,
    CHANNELS_EMAIL_METRIC_FACTORIES,
} from 'domains/reporting/pages/performance/channels/email/config/breakdownTableMetrics'
import {
    fetchMetricPerChannel,
    useMetricPerChannel,
} from 'domains/reporting/pages/performance/utils/useMetricPerChannel'
import { humanizeChannel } from 'state/ticket/utils'
import { createCsv } from 'utils/file'

const CHANNELS_EMAIL_SUB_CHANNEL_METRICS_CONFIG = Object.fromEntries(
    Object.entries(CHANNELS_EMAIL_METRIC_FACTORIES).map(([key, factory]) => [
        key,
        {
            use: (filters: StatsFilters, timezone: string) =>
                useMetricPerChannel(factory, filters, timezone),
            fetch: (filters: StatsFilters, timezone: string) =>
                fetchMetricPerChannel(factory, filters, timezone),
        },
    ]),
) as Record<ChannelsEmailMetricKey, EntityMetricConfig>

const collectSubChannels = (): string[] => {
    return EMAIL_AND_CONTACT_FORM_CHANNELS
}

export const usePerformanceChannelsEmailSubChannelMetrics =
    (): ChannelsEmailMetricsData => {
        const { cleanStatsFilters, userTimezone } = useStatsFilters()

        const {
            data: entityData,
            isLoading,
            isError,
            loadingStates,
        } = useEntityMetrics(
            CHANNELS_EMAIL_SUB_CHANNEL_METRICS_CONFIG,
            cleanStatsFilters,
            userTimezone,
        )

        const data = useMemo(() => {
            const subChannels = collectSubChannels()
            return assembleEntityRows(
                subChannels,
                buildChannelsEmailEntityRow(entityData),
            )
        }, [entityData])

        return { data, isLoading, isError, loadingStates }
    }

const CHANNELS_EMAIL_SUB_CHANNEL_FILENAME =
    'performance-channels-email_by-sub-channel'

export const fetchPerformanceChannelsEmailSubChannelMetrics = async (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<{ fileName: string; files: Record<string, string> }> => {
    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        CHANNELS_EMAIL_SUB_CHANNEL_FILENAME,
    )

    const metrics = await fetchEntityMetrics(
        CHANNELS_EMAIL_SUB_CHANNEL_METRICS_CONFIG,
        statsFilters,
        timezone,
    )

    const subChannels = collectSubChannels()
    const rows = assembleEntityRows(
        subChannels,
        buildChannelsEmailEntityRow(metrics.data),
    )

    if (rows.length === 0) {
        return { fileName, files: { [fileName]: '' } }
    }

    const headers = [
        CHANNELS_EMAIL_SUB_CHANNEL_TABLE.title,
        ...CHANNELS_EMAIL_SUB_CHANNEL_COLUMNS.map((col) => col.label),
    ]
    const csvRows = rows.map((row) => [
        humanizeChannel(row.entity),
        ...CHANNELS_EMAIL_SUB_CHANNEL_COLUMNS.map((col) =>
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

export const fetchPerformanceChannelsEmailSubChannelAsConfigurableTable: ConfigurableGraphFetch =
    async (_savedMeasure, _savedDimension, filters, timezone) => {
        const { files } = await fetchPerformanceChannelsEmailSubChannelMetrics(
            filters,
            timezone,
        )
        return { files }
    }
