import { User } from 'config/types/user'
import {
    fetchTableReportData,
    TableDataSources,
    TableSummaryDataSources,
    useTableReportData,
} from 'hooks/reporting/common/useTableReportData'
import { getCsvFileNameWithDates } from 'hooks/reporting/common/utils'
import {
    fetchClosedTicketsMetric,
    fetchCustomerSatisfactionMetric,
    fetchMedianFirstResponseTimeMetric,
    fetchMedianResolutionTimeMetric,
    fetchMedianResponseTimeMetric,
    fetchMessagesReceivedMetric,
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
    fetchMedianResponseTimeMetricPerAgent,
    fetchMessagesReceivedMetricPerAgent,
    fetchMessagesSentMetricPerAgent,
    fetchOnlineTimePerAgent,
    fetchTicketAverageHandleTimePerAgent,
    fetchTicketsRepliedMetricPerAgent,
    fetchZeroTouchTicketsMetricPerAgent,
} from 'hooks/reporting/metricsPerAgent'
import { fetchPercentageOfClosedTicketsMetricPerAgent } from 'hooks/reporting/support-performance/agents/usePercentageOfClosedTicketsMetricPerAgent'
import { fetchOneTouchTicketsPercentageMetricPerAgent } from 'hooks/reporting/support-performance/overview/useOneTouchTicketsPercentageMetricPerAgent'
import { fetchOneTouchTicketsPercentageMetricTrend } from 'hooks/reporting/support-performance/overview/useOneTouchTicketsPercentageMetricTrend'
import { fetchZeroTouchTicketsMetricTrend } from 'hooks/reporting/support-performance/overview/useZeroTouchTicketsMetricTrend'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useAgentsTableConfigSetting } from 'hooks/reporting/useAgentsTableConfigSetting'
import {
    fetchMessagesSentPerHour,
    fetchMessagesSentPerHourPerAgentTotalCapacity,
} from 'hooks/reporting/useMessagesSentPerHour'
import { fetchMessagesSentPerHourPerAgent } from 'hooks/reporting/useMessagesSentPerHourPerAgent'
import { MetricWithDecile } from 'hooks/reporting/useMetricPerDimension'
import {
    fetchTicketsClosedPerHour,
    fetchTicketsClosedPerHourPerAgentTotalCapacity,
} from 'hooks/reporting/useTicketsClosedPerHour'
import { fetchTicketsClosedPerHourPerAgent } from 'hooks/reporting/useTicketsClosedPerHourPerAgent'
import {
    fetchTicketsRepliedPerHour,
    fetchTicketsRepliedPerHourPerAgentTotalCapacity,
} from 'hooks/reporting/useTicketsRepliedPerHour'
import { fetchTicketsRepliedPerHourPerAgent } from 'hooks/reporting/useTicketsRepliedPerHourPerAgent'
import useAppSelector from 'hooks/useAppSelector'
import { Channel } from 'models/channel/types'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { BusiestTimeOfDaysMetrics } from 'pages/stats/support-performance/busiest-times-of-days/types'
import { createAgentsReport } from 'services/reporting/agentsPerformanceReportingService'
import { getSortedAgents } from 'state/ui/stats/agentPerformanceSlice'
import { TicketInsightsOrder } from 'state/ui/stats/ticketInsightsSlice'
import {
    AgentsTableColumn,
    AgentsTableRow,
    ChannelsTableColumns,
} from 'state/ui/stats/types'

export const AGENTS_REPORT_FILE_NAME = 'agents-metrics'

export type AgentsReportMetricDataPoints =
    | 'customerSatisfactionMetric'
    | 'medianFirstResponseTimeMetric'
    | 'medianResponseTimeMetric'
    | 'medianResolutionTimeMetric'
    | 'percentageOfClosedTicketsMetric'
    | 'closedTicketsMetric'
    | 'ticketsRepliedMetric'
    | 'messagesSentMetric'
    | 'messagesReceivedMetric'
    | 'oneTouchTicketsMetric'
    | 'zeroTouchTicketsMetric'
    | 'repliedTicketsPerHourMetric'
    | 'onlineTimeMetric'
    | 'messagesSentPerHourMetric'
    | 'closedTicketsPerHourMetric'
    | 'ticketHandleTimeMetric'

export type AgentsReportData = Record<
    AgentsReportMetricDataPoints,
    MetricWithDecile
>

export type AgentsReportAverageData = Record<
    AgentsReportMetricDataPoints,
    Metric
>

export const agentsMetricsDataSources: TableDataSources<AgentsReportData> = [
    {
        fetchData: fetchMedianFirstResponseTimeMetricPerAgent,
        title: 'medianFirstResponseTimeMetric',
    },
    {
        fetchData: fetchMedianResponseTimeMetricPerAgent,
        title: 'medianResponseTimeMetric',
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
        fetchData: fetchMessagesReceivedMetricPerAgent,
        title: 'messagesReceivedMetric',
    },
    {
        fetchData: fetchMedianResolutionTimeMetricPerAgent,
        title: 'medianResolutionTimeMetric',
    },
    {
        fetchData: fetchOneTouchTicketsPercentageMetricPerAgent,
        title: 'oneTouchTicketsMetric',
    },
    {
        fetchData: fetchZeroTouchTicketsMetricPerAgent,
        title: 'zeroTouchTicketsMetric',
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
export const agentsAverageDataSources: TableSummaryDataSources<AgentsReportData> =
    [
        {
            fetchData: fetchMedianFirstResponseTimeMetric,
            title: 'medianFirstResponseTimeMetric',
        },
        {
            fetchData: fetchMedianResponseTimeMetric,
            title: 'medianResponseTimeMetric',
        },
        {
            fetchData: fetchTicketsRepliedMetric,
            title: 'ticketsRepliedMetric',
        },
        {
            fetchData: fetchClosedTicketsMetric,
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
            fetchData: fetchMessagesReceivedMetric,
            title: 'messagesReceivedMetric',
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
            fetchData: fetchZeroTouchTicketsMetricTrend,
            title: 'zeroTouchTicketsMetric',
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

export const agentsTotalDataSources: TableSummaryDataSources<AgentsReportData> =
    [
        ...agentsAverageDataSources,
        {
            fetchData: fetchTicketsRepliedPerHourPerAgentTotalCapacity,
            title: 'repliedTicketsPerHourMetric',
        },
        {
            fetchData: fetchMessagesSentPerHourPerAgentTotalCapacity,
            title: 'messagesSentPerHourMetric',
        },
        {
            fetchData: fetchTicketsClosedPerHourPerAgentTotalCapacity,
            title: 'closedTicketsPerHourMetric',
        },
    ]

export const useDownloadAgentsPerformanceData = () => {
    const agents = useAppSelector<User[]>(getSortedAgents)
    const { columnsOrder, rowsOrder } = useAgentsTableConfigSetting()
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { data: reportData, isFetching } = useTableReportData<
        keyof AgentsReportData,
        MetricWithDecile
    >(cleanStatsFilters, userTimezone, agentsMetricsDataSources)

    const { data: averageData, isFetching: averageIsLoading } =
        useTableReportData<keyof AgentsReportAverageData, Metric>(
            cleanStatsFilters,
            userTimezone,
            agentsAverageDataSources,
        )

    const { data: totalData, isFetching: totalIsLoading } = useTableReportData<
        keyof AgentsReportAverageData,
        Metric
    >(cleanStatsFilters, userTimezone, agentsTotalDataSources)

    const { files } = createAgentsReport(
        agents,
        reportData,
        averageData,
        totalData,
        columnsOrder,
        rowsOrder,
        getCsvFileNameWithDates(
            cleanStatsFilters.period,
            AGENTS_REPORT_FILE_NAME,
        ),
    )
    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        AGENTS_REPORT_FILE_NAME,
    )

    return {
        files,
        fileName,
        isLoading: isFetching || averageIsLoading || totalIsLoading,
    }
}
export const fetchAgentsTableReportData = async (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    _: ReportingGranularity,
    context: {
        agents: User[]
        columnsOrder: AgentsTableColumn[]
        rowsOrder: AgentsTableRow[]
        channels: Channel[]
        channelColumnsOrder: ChannelsTableColumns[]
        selectedBTODMetric: BusiestTimeOfDaysMetrics
        customFieldsOrder: TicketInsightsOrder
        selectedCustomFieldId: string | null
    },
) => {
    const metricConfig = agentsMetricsDataSources
    const averageConfig = agentsAverageDataSources
    const totalConfig = agentsTotalDataSources

    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        AGENTS_REPORT_FILE_NAME,
    )
    return Promise.all([
        fetchTableReportData(cleanStatsFilters, userTimezone, metricConfig),
        fetchTableReportData(cleanStatsFilters, userTimezone, averageConfig),
        fetchTableReportData(cleanStatsFilters, userTimezone, totalConfig),
    ])
        .then(([metrics, average, total]) => {
            return {
                isLoading: false,
                ...createAgentsReport(
                    context.agents,
                    metrics.data,
                    average.data,
                    total.data,
                    context.columnsOrder,
                    context.rowsOrder,
                    fileName,
                ),
                fileName,
            }
        })
        .catch(() => ({ isLoading: false, files: {}, fileName }))
}
