import {
    fetchTableReportData,
    TableDataSources,
    useTableReportData,
} from 'hooks/reporting/common/useTableReportData'
import { getCsvFileNameWithDates } from 'hooks/reporting/common/utils'
import {
    fetchClosedTicketsMetricPerChannel,
    fetchCreatedTicketsMetricPerChannel,
    fetchCustomerSatisfactionMetricPerChannel,
    fetchMedianFirstResponseTimeMetricPerChannel,
    fetchMedianResolutionTimeMetricPerChannel,
    fetchMedianResponseTimeMetricPerChannel,
    fetchMessagesReceivedMetricPerChannel,
    fetchMessagesSentMetricPerChannel,
    fetchTicketAverageHandleTimePerChannel,
    fetchTicketsRepliedMetricPerChannel,
} from 'hooks/reporting/support-performance/channels/metricsPerChannel'
import { fetchPercentageOfCreatedTicketsMetricPerChannel } from 'hooks/reporting/support-performance/channels/usePercentageOfCreatedTicketsMetricPerChannel'
import { useSortedChannels } from 'hooks/reporting/support-performance/useSortedChannels'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useChannelsTableSetting } from 'hooks/reporting/useChannelsTableConfigSetting'
import { MetricWithDecile } from 'hooks/reporting/useMetricPerDimension'
import { Channel } from 'models/channel/types'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { saveReport } from 'services/reporting/channelsReportingService'
import { ChannelsTableColumns } from 'state/ui/stats/types'

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

    const { files } = saveReport(channels, reportData, columnsOrder, fileName)

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
                    fileName,
                ),
                fileName,
            }
        })
        .catch(() => ({ isLoading: false, isError: true, files: {}, fileName }))
}
