import { ChannelsReportData } from 'domains/reporting/hooks/support-performance/channels/useChannelsReportMetrics'
import { nonEmptyChannels } from 'domains/reporting/hooks/support-performance/nonEmptyChannel'
import { MetricWithDecile } from 'domains/reporting/hooks/useMetricPerDimension'
import { AgentTimeTrackingCube } from 'domains/reporting/models/cubes/agentxp/AgentTimeTrackingCube'
import {
    HandleTimeCube,
    HandleTimeMeasure,
} from 'domains/reporting/models/cubes/agentxp/HandleTimeCube'
import {
    HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins,
    HelpdeskCustomerMessagesReceivedEnrichedMeasure,
} from 'domains/reporting/models/cubes/HelpdeskCustomerMessagesReceivedEnrichedCube'
import {
    HelpdeskMessageCubeWithJoins,
    HelpdeskMessageMeasure,
} from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import { TicketMeasure } from 'domains/reporting/models/cubes/TicketCube'
import { TicketMessagesMeasure } from 'domains/reporting/models/cubes/TicketMessagesCube'
import { TicketMessagesEnrichedResponseTimesMeasure } from 'domains/reporting/models/cubes/TicketMessagesEnrichedResponseTimesCube'
import { TicketSatisfactionSurveyMeasure } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { CHANNEL_DIMENSION } from 'domains/reporting/models/queryFactories/support-performance/constants'
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
import { Channel } from 'models/channel/types'
import { createCsv } from 'utils/file'

export type ChannelsReportMetrics =
    | HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins['measures']
    | HelpdeskMessageCubeWithJoins['dimensions']
    | HelpdeskMessageCubeWithJoins['measures']
    | AgentTimeTrackingCube['measures']
    | HandleTimeCube['measures']

type ReportDataMap = Record<
    ChannelsTableColumns,
    {
        column: ChannelsTableColumns
        metricData: Pick<MetricWithDecile, 'data'>
        idField: string
        metricField: ChannelsReportMetrics
    }
>

const TicketCount = TicketMeasure.TicketCount
const MedianFirstResponseTime = TicketMessagesMeasure.MedianFirstResponseTime
const MedianResponseTime =
    TicketMessagesEnrichedResponseTimesMeasure.MedianResponseTime
const MedianResolutionTime = TicketMessagesMeasure.MedianResolutionTime
const HelpdeskTicketCount = HelpdeskMessageMeasure.TicketCount
const MessageCount = HelpdeskMessageMeasure.MessageCount
const MessageReceivedCount =
    HelpdeskCustomerMessagesReceivedEnrichedMeasure.MessageCount
const AvgSurveyScore = TicketSatisfactionSurveyMeasure.AvgSurveyScore
const AverageHandleTime = HandleTimeMeasure.AverageHandleTime

const formatMetric = (column: ChannelsTableColumns, value?: number | null) =>
    formatMetricValue(
        value,
        ChannelColumnConfig[column].format,
        NOT_AVAILABLE_PLACEHOLDER,
    )
const getChannelMetric = (
    channelSlug: string,
    data: Pick<MetricWithDecile, 'data'>,
    channelIdField: string,
    metricField: ChannelsReportMetrics,
) => {
    const metricValue = data.data?.allData.find(
        (item) => item[channelIdField] === channelSlug,
    )?.[metricField]
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
              getChannelMetric(
                  channel.slug,
                  summaryDataMap[column].metricData,
                  summaryDataMap[column].idField,
                  summaryDataMap[column].metricField,
              ),
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
            idField: CHANNEL_DIMENSION,
            metricField: AvgSurveyScore,
        },
        [ChannelsTableColumns.CustomerSatisfaction]: {
            column: ChannelsTableColumns.CustomerSatisfaction,
            metricData: data.customerSatisfactionMetricPerChannel,
            idField: CHANNEL_DIMENSION,
            metricField: AvgSurveyScore,
        },
        [ChannelsTableColumns.FirstResponseTime]: {
            column: ChannelsTableColumns.FirstResponseTime,
            metricData: data.medianFirstResponseTimeMetricPerChannel,
            idField: CHANNEL_DIMENSION,
            metricField: MedianFirstResponseTime,
        },
        [ChannelsTableColumns.MedianResponseTime]: {
            column: ChannelsTableColumns.MedianResponseTime,
            metricData: data.medianResponseTimeMetricPerChannel,
            idField: CHANNEL_DIMENSION,
            metricField: MedianResponseTime,
        },
        [ChannelsTableColumns.MedianResolutionTime]: {
            column: ChannelsTableColumns.MedianResolutionTime,
            metricData: data.medianResolutionTimeMetricPerChannel,
            idField: CHANNEL_DIMENSION,
            metricField: MedianResolutionTime,
        },
        [ChannelsTableColumns.TicketsCreated]: {
            column: ChannelsTableColumns.TicketsCreated,
            metricData: data.createdTicketsMetricPerChannel,
            idField: CHANNEL_DIMENSION,
            metricField: TicketCount,
        },
        [ChannelsTableColumns.CreatedTicketsPercentage]: {
            column: ChannelsTableColumns.CreatedTicketsPercentage,
            metricData: data.percentageOfCreatedTicketsMetricPerChannel,
            idField: CHANNEL_DIMENSION,
            metricField: TicketCount,
        },
        [ChannelsTableColumns.ClosedTickets]: {
            column: ChannelsTableColumns.ClosedTickets,
            metricData: data.closedTicketsMetricPerChannel,
            idField: CHANNEL_DIMENSION,
            metricField: TicketCount,
        },
        [ChannelsTableColumns.MessagesSent]: {
            column: ChannelsTableColumns.MessagesSent,
            metricData: data.messagesSentMetricPerChannel,
            idField: CHANNEL_DIMENSION,
            metricField: MessageCount,
        },
        [ChannelsTableColumns.MessagesReceived]: {
            column: ChannelsTableColumns.MessagesReceived,
            metricData: data.messagesReceivedMetricPerChannel,
            idField: CHANNEL_DIMENSION,
            metricField: MessageReceivedCount,
        },
        [ChannelsTableColumns.TicketsReplied]: {
            column: ChannelsTableColumns.TicketsReplied,
            metricData: data.ticketsRepliedMetricPerChannel,
            idField: CHANNEL_DIMENSION,
            metricField: HelpdeskTicketCount,
        },
        [ChannelsTableColumns.TicketHandleTime]: {
            column: ChannelsTableColumns.TicketHandleTime,
            metricData: data?.ticketAverageHandleTimePerChannel,
            idField: CHANNEL_DIMENSION,
            metricField: AverageHandleTime,
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
