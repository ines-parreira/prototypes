import {User} from 'config/types/user'
import {
    fetchTableReportData,
    TableDataSources,
    TableSummaryDataSources,
    useTableReportData,
} from 'hooks/reporting/common/useTableReportData'
import {
    fetchClosedTicketsMetric,
    fetchCustomerSatisfactionMetric,
    fetchMedianFirstResponseTimeMetric,
    fetchMedianResolutionTimeMetric,
    fetchMessagesSentMetric,
    fetchOnlineTimeMetric,
    fetchTicketAverageHandleTimeMetric,
    fetchTicketsRepliedMetric,
    Metric,
} from 'hooks/reporting/metrics'
import {
    fetchClosedTicketsMetricPerAgent,
    fetchCustomerSatisfactionMetricPerAgent,
    fetchMedianFirstResponseTimeMetricPerAgent,
    fetchMedianResolutionTimeMetricPerAgent,
    fetchMessagesSentMetricPerAgent,
    fetchOneTouchTicketsMetricPerAgent,
    fetchOnlineTimePerAgent,
    fetchTicketAverageHandleTimePerAgent,
    fetchTicketsRepliedMetricPerAgent,
} from 'hooks/reporting/metricsPerAgent'
import {fetchOneTouchTicketsPercentageMetricTrend} from 'hooks/reporting/support-performance/agents/useOneTouchTicketsPercentageMetricTrend'
import {fetchPercentageOfClosedTicketsMetricPerAgent} from 'hooks/reporting/support-performance/agents/usePercentageOfClosedTicketsMetricPerAgent'
import {getCsvFileNameWithDates} from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {useAgentsTableConfigSetting} from 'hooks/reporting/useAgentsTableConfigSetting'
import {fetchMessagesSentPerHour} from 'hooks/reporting/useMessagesSentPerHour'
import {fetchMessagesSentPerHourPerAgent} from 'hooks/reporting/useMessagesSentPerHourPerAgent'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {fetchTicketsClosedPerHour} from 'hooks/reporting/useTicketsClosedPerHour'
import {fetchTicketsClosedPerHourPerAgent} from 'hooks/reporting/useTicketsClosedPerHourPerAgent'
import {fetchTicketsRepliedPerHour} from 'hooks/reporting/useTicketsRepliedPerHour'
import {fetchTicketsRepliedPerHourPerAgent} from 'hooks/reporting/useTicketsRepliedPerHourPerAgent'
import useAppSelector from 'hooks/useAppSelector'
import {Channel} from 'models/channel/types'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {BusiestTimeOfDaysMetrics} from 'pages/stats/support-performance/busiest-times-of-days/types'
import {createAgentsReport} from 'services/reporting/agentsPerformanceReportingService'
import {getSortedAgents} from 'state/ui/stats/agentPerformanceSlice'
import {TicketInsightsOrder} from 'state/ui/stats/ticketInsightsSlice'
import {AgentsTableColumn, ChannelsTableColumns} from 'state/ui/stats/types'

export const AGENTS_REPORT_FILE_NAME = 'agents-metrics'

export type AgentsReportMetricDataPoints =
    | 'customerSatisfactionMetric'
    | 'medianFirstResponseTimeMetric'
    | 'medianResolutionTimeMetric'
    | 'percentageOfClosedTicketsMetric'
    | 'closedTicketsMetric'
    | 'ticketsRepliedMetric'
    | 'messagesSentMetric'
    | 'oneTouchTicketsMetric'
    | 'repliedTicketsPerHourMetric'
    | 'onlineTimeMetric'
    | 'messagesSentPerHourMetric'
    | 'closedTicketsPerHourMetric'
    | 'ticketHandleTimeMetric'

export type AgentsReportData = Record<
    AgentsReportMetricDataPoints,
    MetricWithDecile
>

export type AgentsReportSummaryData = Record<
    AgentsReportMetricDataPoints,
    Metric
>

export const agentsMetricsDataSources: TableDataSources<AgentsReportData> = [
    {
        fetchData: fetchMedianFirstResponseTimeMetricPerAgent,
        title: 'medianFirstResponseTimeMetric',
    },
    {
        fetchData: fetchTicketsRepliedMetricPerAgent,
        title: 'ticketsRepliedMetric',
    },
    {
        fetchData: fetchClosedTicketsMetricPerAgent,
        title: 'closedTicketsMetric',
    },
    {
        fetchData: fetchCustomerSatisfactionMetricPerAgent,
        title: 'customerSatisfactionMetric',
    },
    {
        fetchData: fetchPercentageOfClosedTicketsMetricPerAgent,
        title: 'percentageOfClosedTicketsMetric',
    },
    {
        fetchData: fetchMessagesSentMetricPerAgent,
        title: 'messagesSentMetric',
    },
    {
        fetchData: fetchMedianResolutionTimeMetricPerAgent,
        title: 'medianResolutionTimeMetric',
    },
    {
        fetchData: fetchOneTouchTicketsMetricPerAgent,
        title: 'oneTouchTicketsMetric',
    },
    {
        fetchData: fetchTicketsRepliedPerHourPerAgent,
        title: 'repliedTicketsPerHourMetric',
    },
    {
        fetchData: fetchOnlineTimePerAgent,
        title: 'onlineTimeMetric',
    },
    {
        fetchData: fetchMessagesSentPerHourPerAgent,
        title: 'messagesSentPerHourMetric',
    },
    {
        fetchData: fetchTicketsClosedPerHourPerAgent,
        title: 'closedTicketsPerHourMetric',
    },
    {
        fetchData: fetchTicketAverageHandleTimePerAgent,
        title: 'ticketHandleTimeMetric',
    },
]
export const agentsSummaryDataSources: TableSummaryDataSources<AgentsReportData> =
    [
        {
            fetchData: fetchMedianFirstResponseTimeMetric,
            title: 'medianFirstResponseTimeMetric',
        },
        {
            fetchData: fetchTicketsRepliedMetric,
            title: 'ticketsRepliedMetric',
        },
        {
            fetchData: fetchCustomerSatisfactionMetric,
            title: 'closedTicketsMetric',
        },
        {
            fetchData: fetchCustomerSatisfactionMetric,
            title: 'customerSatisfactionMetric',
        },
        {
            fetchData: fetchClosedTicketsMetric,
            title: 'percentageOfClosedTicketsMetric',
        },
        {
            fetchData: fetchMessagesSentMetric,
            title: 'messagesSentMetric',
        },
        {
            fetchData: fetchMedianResolutionTimeMetric,
            title: 'medianResolutionTimeMetric',
        },
        {
            fetchData: fetchOneTouchTicketsPercentageMetricTrend,
            title: 'oneTouchTicketsMetric',
        },
        {
            fetchData: fetchTicketsRepliedPerHour,
            title: 'repliedTicketsPerHourMetric',
        },
        {
            fetchData: fetchOnlineTimeMetric,
            title: 'onlineTimeMetric',
        },
        {
            fetchData: fetchMessagesSentPerHour,
            title: 'messagesSentPerHourMetric',
        },
        {
            fetchData: fetchTicketsClosedPerHour,
            title: 'closedTicketsPerHourMetric',
        },
        {
            fetchData: fetchTicketAverageHandleTimeMetric,
            title: 'ticketHandleTimeMetric',
        },
    ]

export const useDownloadAgentsPerformanceData = () => {
    const agents = useAppSelector<User[]>(getSortedAgents)
    const {columnsOrder} = useAgentsTableConfigSetting()
    const {cleanStatsFilters, userTimezone} = useNewStatsFilters()

    const {data: reportData, isFetching} = useTableReportData<
        keyof AgentsReportData,
        MetricWithDecile
    >(cleanStatsFilters, userTimezone, agentsMetricsDataSources)

    const {data: summaryData, isFetching: summaryIsLoading} =
        useTableReportData<keyof AgentsReportSummaryData, Metric>(
            cleanStatsFilters,
            userTimezone,
            agentsSummaryDataSources
        )

    const {files} = createAgentsReport(
        agents,
        reportData,
        summaryData,
        columnsOrder,
        getCsvFileNameWithDates(
            cleanStatsFilters.period,
            AGENTS_REPORT_FILE_NAME
        )
    )
    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        AGENTS_REPORT_FILE_NAME
    )

    return {
        files,
        fileName,
        isLoading: isFetching || summaryIsLoading,
    }
}
export const fetchAgentsTableReportData = async (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    _: ReportingGranularity,
    context: {
        agents: User[]
        columnsOrder: AgentsTableColumn[]
        channels: Channel[]
        channelColumnsOrder: ChannelsTableColumns[]
        selectedBTODMetric: BusiestTimeOfDaysMetrics
        customFieldsOrder: TicketInsightsOrder
        selectedCustomFieldId: string | null
    }
) => {
    const metricConfig = agentsMetricsDataSources
    const summaryConfig = agentsSummaryDataSources
    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        AGENTS_REPORT_FILE_NAME
    )
    return Promise.all([
        fetchTableReportData(cleanStatsFilters, userTimezone, metricConfig),
        fetchTableReportData(cleanStatsFilters, userTimezone, summaryConfig),
    ])
        .then(([metrics, summary]) => {
            return {
                isLoading: false,
                ...createAgentsReport(
                    context.agents,
                    metrics.data,
                    summary.data,
                    context.columnsOrder,
                    fileName
                ),
                fileName,
            }
        })
        .catch(() => ({isLoading: false, files: {}, fileName}))
}
