import type { ChannelsReportData } from 'domains/reporting/hooks/support-performance/channels/useChannelsReportMetrics'
import { nonEmptyChannels } from 'domains/reporting/hooks/support-performance/nonEmptyChannel'
import type { MetricWithDecile } from 'domains/reporting/hooks/types'
import type { AgentTimeTrackingCube } from 'domains/reporting/models/cubes/agentxp/AgentTimeTrackingCube'
import type { HandleTimeCube } from 'domains/reporting/models/cubes/agentxp/HandleTimeCube'
import type { HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskCustomerMessagesReceivedEnrichedCube'
import type { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import type { TicketFirstHumanAgentResponseTimeCube } from 'domains/reporting/models/cubes/TicketFirstHumanAgentResponseTime'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import {
    ChannelColumnConfig,
    ChannelsTableLabels,
    LeadColumn,
} from 'domains/reporting/pages/support-performance/channels/ChannelsTableConfig'
import { ChannelsTableColumns } from 'domains/reporting/state/ui/stats/types'
import type { Channel } from 'models/channel/types'
import { createCsv } from 'utils/file'

export type ChannelsReportMetrics =
    | HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins['measures']
    | HelpdeskMessageCubeWithJoins['dimensions']
    | HelpdeskMessageCubeWithJoins['measures']
    | AgentTimeTrackingCube['measures']
    | HandleTimeCube['measures']
    | TicketFirstHumanAgentResponseTimeCube['measures']

type ReportDataMap = Record<
    ChannelsTableColumns,
    {
        column: ChannelsTableColumns
        metricData: Pick<MetricWithDecile, 'data'>
    }
>

const formatMetric = (column: ChannelsTableColumns, value?: number | null) =>
    formatMetricValue(
        value,
        ChannelColumnConfig[column].format,
        NOT_AVAILABLE_PLACEHOLDER,
    )
export const getChannelMetric = (
    channelSlug: string,
    data: Pick<MetricWithDecile, 'data'>,
) => {
    if (!data.data) return null
    const metricData = data.data

    const firstDimension = metricData.dimensions?.[0] || ''
    const firstMeasure = metricData.measures?.[0] || ''

    const metricValue = data.data?.allData.find(
        (item) => item[firstDimension] === channelSlug,
    )?.[firstMeasure]
    return typeof metricValue === 'string' ? Number(metricValue) : metricValue
}

const getMetric = (
    column: ChannelsTableColumns,
    channel: Channel,
    summaryDataMap: ReportDataMap,
) =>
    column === LeadColumn
        ? channel.slug
        : formatMetric(
              column,
              getChannelMetric(channel.slug, summaryDataMap[column].metricData),
          )

export const saveReport = (
    channels: Channel[],
    data: ChannelsReportData | null,
    columnsOrder: ChannelsTableColumns[],
    fileName: string,
) => {
    if (data === null) {
        return {
            files: {},
        }
    }

    const visibleChannels = nonEmptyChannels(channels, data)

    const columnsToMetricDataMap: ReportDataMap = {
        [ChannelsTableColumns.Channel]: {
            column: ChannelsTableColumns.Channel,
            metricData: { data: null },
        },
        [ChannelsTableColumns.CustomerSatisfaction]: {
            column: ChannelsTableColumns.CustomerSatisfaction,
            metricData: data.customerSatisfactionMetricPerChannel,
        },
        [ChannelsTableColumns.FirstResponseTime]: {
            column: ChannelsTableColumns.FirstResponseTime,
            metricData: data.medianFirstResponseTimeMetricPerChannel,
        },
        [ChannelsTableColumns.HumanResponseTimeAfterAiHandoff]: {
            column: ChannelsTableColumns.HumanResponseTimeAfterAiHandoff,
            metricData: data.humanTimeAfterAiHandoffMetricPerChannel,
        },
        [ChannelsTableColumns.MedianResponseTime]: {
            column: ChannelsTableColumns.MedianResponseTime,
            metricData: data.medianResponseTimeMetricPerChannel,
        },
        [ChannelsTableColumns.MedianResolutionTime]: {
            column: ChannelsTableColumns.MedianResolutionTime,
            metricData: data.medianResolutionTimeMetricPerChannel,
        },
        [ChannelsTableColumns.TicketsCreated]: {
            column: ChannelsTableColumns.TicketsCreated,
            metricData: data.createdTicketsMetricPerChannel,
        },
        [ChannelsTableColumns.CreatedTicketsPercentage]: {
            column: ChannelsTableColumns.CreatedTicketsPercentage,
            metricData: data.percentageOfCreatedTicketsMetricPerChannel,
        },
        [ChannelsTableColumns.ClosedTickets]: {
            column: ChannelsTableColumns.ClosedTickets,
            metricData: data.closedTicketsMetricPerChannel,
        },
        [ChannelsTableColumns.MessagesSent]: {
            column: ChannelsTableColumns.MessagesSent,
            metricData: data.messagesSentMetricPerChannel,
        },
        [ChannelsTableColumns.MessagesReceived]: {
            column: ChannelsTableColumns.MessagesReceived,
            metricData: data.messagesReceivedMetricPerChannel,
        },
        [ChannelsTableColumns.TicketsReplied]: {
            column: ChannelsTableColumns.TicketsReplied,
            metricData: data.ticketsRepliedMetricPerChannel,
        },
        [ChannelsTableColumns.TicketHandleTime]: {
            column: ChannelsTableColumns.TicketHandleTime,
            metricData: data?.ticketAverageHandleTimePerChannel,
        },
    }

    const metricData = [
        columnsOrder.map((column) => ChannelsTableLabels[column]),
        ...visibleChannels.map((channel) => {
            return columnsOrder.map((column) =>
                getMetric(column, channel, columnsToMetricDataMap),
            )
        }),
    ]

    return {
        files: {
            [fileName]: createCsv(metricData),
        },
    }
}
