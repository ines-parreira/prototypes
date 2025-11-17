import type { TableDataSources } from 'domains/reporting/hooks/common/useTableReportData'
import {
    fetchTableReportData,
    useTableReportData,
} from 'domains/reporting/hooks/common/useTableReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import {
    fetchClosedTicketsMetricPerChannel,
    fetchCreatedTicketsMetricPerChannel,
    fetchCustomerSatisfactionMetricPerChannel,
    fetchHumanResponseTimeAfterAiHandoffPerChannel,
    fetchMedianFirstResponseTimeMetricPerChannel,
    fetchMedianResolutionTimeMetricPerChannel,
    fetchMedianResponseTimeMetricPerChannel,
    fetchMessagesReceivedMetricPerChannel,
    fetchMessagesSentMetricPerChannel,
    fetchTicketAverageHandleTimePerChannel,
    fetchTicketsRepliedMetricPerChannel,
} from 'domains/reporting/hooks/support-performance/channels/metricsPerChannel'
import { fetchPercentageOfCreatedTicketsMetricPerChannel } from 'domains/reporting/hooks/support-performance/channels/usePercentageOfCreatedTicketsMetricPerChannel'
import { useSortedChannels } from 'domains/reporting/hooks/support-performance/useSortedChannels'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useChannelsTableSetting } from 'domains/reporting/hooks/useChannelsTableConfigSetting'
import type { MetricWithDecile } from 'domains/reporting/hooks/useMetricPerDimension'
import { useShouldIncludeBots } from 'domains/reporting/hooks/useShouldIncludeBots'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { saveReport } from 'domains/reporting/services/channelsReportingService'
import type { ChannelsTableColumns } from 'domains/reporting/state/ui/stats/types'
import type { Channel } from 'models/channel/types'

export const CHANNELS_REPORT_FILE_NAME = 'channels-metrics'

export type ChannelsReportDataPoints =
    | 'closedTicketsMetricPerChannel'
    | 'createdTicketsMetricPerChannel'
    | 'customerSatisfactionMetricPerChannel'
    | 'medianFirstResponseTimeMetricPerChannel'
    | 'medianResponseTimeMetricPerChannel'
    | 'medianResolutionTimeMetricPerChannel'
    | 'messagesSentMetricPerChannel'
    | 'messagesReceivedMetricPerChannel'
    | 'percentageOfCreatedTicketsMetricPerChannel'
    | 'ticketAverageHandleTimePerChannel'
    | 'ticketsRepliedMetricPerChannel'
    | 'humanTimeAfterAiHandoffMetricPerChannel'

export type ChannelsReportData = Record<
    ChannelsReportDataPoints,
    MetricWithDecile
>
export const ChannelsMetricsDataSources: TableDataSources<ChannelsReportData> =
    [
        {
            fetchData: fetchClosedTicketsMetricPerChannel,
            title: 'closedTicketsMetricPerChannel',
        },
        {
            fetchData: fetchCreatedTicketsMetricPerChannel,
            title: 'createdTicketsMetricPerChannel',
        },
        {
            fetchData: fetchCustomerSatisfactionMetricPerChannel,
            title: 'customerSatisfactionMetricPerChannel',
        },
        {
            fetchData: fetchMedianFirstResponseTimeMetricPerChannel,
            title: 'medianFirstResponseTimeMetricPerChannel',
        },
        {
            fetchData: fetchHumanResponseTimeAfterAiHandoffPerChannel,
            title: 'humanTimeAfterAiHandoffMetricPerChannel',
        },
        {
            fetchData: fetchMedianResolutionTimeMetricPerChannel,
            title: 'medianResolutionTimeMetricPerChannel',
        },
        {
            fetchData: fetchMessagesSentMetricPerChannel,
            title: 'messagesSentMetricPerChannel',
        },
        {
            fetchData: fetchMessagesReceivedMetricPerChannel,
            title: 'messagesReceivedMetricPerChannel',
        },
        {
            fetchData: fetchPercentageOfCreatedTicketsMetricPerChannel,
            title: 'percentageOfCreatedTicketsMetricPerChannel',
        },
        {
            fetchData: fetchTicketAverageHandleTimePerChannel,
            title: 'ticketAverageHandleTimePerChannel',
        },
        {
            fetchData: fetchTicketsRepliedMetricPerChannel,
            title: 'ticketsRepliedMetricPerChannel',
        },
        {
            fetchData: fetchMedianResponseTimeMetricPerChannel,
            title: 'medianResponseTimeMetricPerChannel',
        },
    ]

export const useChannelsReportMetrics = () => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const { columnsOrder } = useChannelsTableSetting()
    const { sortedChannels: channels, isLoading } = useSortedChannels()

    const { data: reportData, isFetching } = useTableReportData<
        keyof ChannelsReportData,
        MetricWithDecile
    >(cleanStatsFilters, userTimezone, ChannelsMetricsDataSources)

    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        CHANNELS_REPORT_FILE_NAME,
    )

    const shouldIncludeBots = useShouldIncludeBots()

    const { files } = saveReport(
        channels,
        reportData,
        columnsOrder,
        shouldIncludeBots,
        fileName,
    )

    return {
        files,
        fileName,
        reportData,
        channels,
        isLoading: isLoading || isFetching,
    }
}

export const fetchChannelsTableReportData = async (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    _: ReportingGranularity,
    context: {
        channels: Channel[]
        channelColumnsOrder: ChannelsTableColumns[]
        shouldIncludeBots: boolean
    },
) => {
    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        CHANNELS_REPORT_FILE_NAME,
    )
    return Promise.all([
        fetchTableReportData(
            cleanStatsFilters,
            userTimezone,
            ChannelsMetricsDataSources,
        ),
    ])
        .then(([metrics]) => {
            return {
                isLoading: false,
                isError: false,
                ...saveReport(
                    context.channels,
                    metrics.data,
                    context.channelColumnsOrder,
                    context.shouldIncludeBots,
                    fileName,
                ),
                fileName,
            }
        })
        .catch(() => ({ isLoading: false, isError: true, files: {}, fileName }))
}
