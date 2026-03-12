import type { User } from 'config/types/user'
import type {
    TableDataSources,
    TableSummaryDataSources,
} from 'domains/reporting/hooks/common/useTableReportData'
import {
    fetchTableReportData,
    useTableReportData,
} from 'domains/reporting/hooks/common/useTableReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import type { Metric } from 'domains/reporting/hooks/metrics'
import {
    fetchClosedTicketsMetric,
    fetchCustomerSatisfactionMetric,
    fetchHumanResponseTimeAfterAiHandoffMetric,
    fetchMedianFirstResponseTimeMetric,
    fetchMedianResolutionTimeMetric,
    fetchMedianResponseTimeMetric,
    fetchMessagesReceivedMetric,
    fetchMessagesSentMetric,
    fetchOnlineTimeMetric,
    fetchTicketAverageHandleTimeMetric,
    fetchTicketsRepliedMetric,
} from 'domains/reporting/hooks/metrics'
import {
    fetchClosedTicketsMetricPerAgent,
    fetchCustomerSatisfactionMetricPerAgent,
    fetchHumanResponseTimeAfterAiHandoffPerAgent,
    fetchMedianFirstResponseTimeMetricPerAgent,
    fetchMedianResolutionTimeMetricPerAgent,
    fetchMedianResponseTimeMetricPerAgent,
    fetchMessagesReceivedMetricPerAgent,
    fetchMessagesSentMetricPerAgent,
    fetchOnlineTimePerAgent,
    fetchTicketAverageHandleTimePerAgent,
    fetchTicketsRepliedMetricPerAgent,
    fetchZeroTouchTicketsMetricPerAgent,
} from 'domains/reporting/hooks/metricsPerAgent'
import { fetchPercentageOfClosedTicketsMetricPerAgent } from 'domains/reporting/hooks/support-performance/agents/usePercentageOfClosedTicketsMetricPerAgent'
import { fetchOneTouchTicketsPercentageMetricPerAgent } from 'domains/reporting/hooks/support-performance/overview/useOneTouchTicketsPercentageMetricPerAgent'
import { fetchOneTouchTicketsPercentageMetricTrend } from 'domains/reporting/hooks/support-performance/overview/useOneTouchTicketsPercentageMetricTrend'
import { fetchZeroTouchTicketsMetricTrend } from 'domains/reporting/hooks/support-performance/overview/useZeroTouchTicketsMetricTrend'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { MetricWithDecile } from 'domains/reporting/hooks/types'
import { useAgentsTableConfigSetting } from 'domains/reporting/hooks/useAgentsTableConfigSetting'
import {
    fetchMessagesSentPerHour,
    fetchMessagesSentPerHourPerAgentTotalCapacity,
} from 'domains/reporting/hooks/useMessagesSentPerHour'
import { fetchMessagesSentPerHourPerAgent } from 'domains/reporting/hooks/useMessagesSentPerHourPerAgent'
import {
    fetchTicketsClosedPerHour,
    fetchTicketsClosedPerHourPerAgentTotalCapacity,
} from 'domains/reporting/hooks/useTicketsClosedPerHour'
import { fetchTicketsClosedPerHourPerAgent } from 'domains/reporting/hooks/useTicketsClosedPerHourPerAgent'
import {
    fetchTicketsRepliedPerHour,
    fetchTicketsRepliedPerHourPerAgentTotalCapacity,
} from 'domains/reporting/hooks/useTicketsRepliedPerHour'
import { fetchTicketsRepliedPerHourPerAgent } from 'domains/reporting/hooks/useTicketsRepliedPerHourPerAgent'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import type { BusiestTimeOfDaysMetrics } from 'domains/reporting/pages/support-performance/busiest-times-of-days/types'
import { createAgentsReport } from 'domains/reporting/services/agentsPerformanceReportingService'
import { getSortedAgents } from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import type { TicketInsightsOrder } from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import type {
    AgentsTableColumn,
    AgentsTableRow,
    ChannelsTableColumns,
} from 'domains/reporting/state/ui/stats/types'
import useAppSelector from 'hooks/useAppSelector'
import type { Channel } from 'models/channel/types'

export const AGENTS_REPORT_FILE_NAME = 'agents-metrics'

export type AgentsReportMetricDataPoints =
    | 'customerSatisfactionMetric'
    | 'humanResponseTimeAfterAiHandoffMetric'
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
        fetchData: fetchHumanResponseTimeAfterAiHandoffPerAgent,
        title: 'humanResponseTimeAfterAiHandoffMetric',
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
            fetchData: fetchHumanResponseTimeAfterAiHandoffMetric,
            title: 'humanResponseTimeAfterAiHandoffMetric',
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
        selectedCustomFieldId: number | null
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
