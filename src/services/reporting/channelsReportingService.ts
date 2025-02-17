import {ChannelsReportData} from 'hooks/reporting/support-performance/channels/useChannelsReportMetrics'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {Channel} from 'models/channel/types'
import {AgentTimeTrackingCube} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import {
    HandleTimeCube,
    HandleTimeMeasure,
} from 'models/reporting/cubes/agentxp/HandleTimeCube'
import {
    HelpdeskMessageCubeWithJoins,
    HelpdeskMessageMeasure,
} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {TicketMessagesMeasure} from 'models/reporting/cubes/TicketMessagesCube'
import {TicketSatisfactionSurveyMeasure} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {CHANNEL_DIMENSION} from 'models/reporting/queryFactories/support-performance/constants'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {
    ChannelColumnConfig,
    ChannelsTableLabels,
    LeadColumn,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {ChannelsTableColumns} from 'state/ui/stats/types'
import {createCsv} from 'utils/file'

export type ChannelsReportMetrics =
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
const MedianResolutionTime = TicketMessagesMeasure.MedianResolutionTime
const HelpdeskTicketCount = HelpdeskMessageMeasure.TicketCount
const MessageCount = HelpdeskMessageMeasure.MessageCount
const AvgSurveyScore = TicketSatisfactionSurveyMeasure.AvgSurveyScore
const AverageHandleTime = HandleTimeMeasure.AverageHandleTime

const formatMetric = (column: ChannelsTableColumns, value?: number | null) =>
    formatMetricValue(
        value,
        ChannelColumnConfig[column].format,
        NOT_AVAILABLE_PLACEHOLDER
    )
const getChannelMetric = (
    channelSlug: string,
    data: Pick<MetricWithDecile, 'data'>,
    channelIdField: string,
    metricField: ChannelsReportMetrics
) => {
    const metricValue = data.data?.allData.find(
        (item) => item[channelIdField] === channelSlug
    )?.[metricField]
    return typeof metricValue === 'string' ? Number(metricValue) : metricValue
}

const getMetric = (
    column: ChannelsTableColumns,
    channel: Channel,
    summaryDataMap: ReportDataMap
) =>
    column === LeadColumn
        ? channel.slug
        : formatMetric(
              column,
              getChannelMetric(
                  channel.slug,
                  summaryDataMap[column].metricData,
                  summaryDataMap[column].idField,
                  summaryDataMap[column].metricField
              )
          )

export const saveReport = (
    channels: Channel[],
    data: ChannelsReportData | null,
    columnsOrder: ChannelsTableColumns[],
    fileName: string
) => {
    if (data === null) {
        return {
            files: {},
        }
    }

    const columnsToMetricDataMap: ReportDataMap = {
        [ChannelsTableColumns.Channel]: {
            column: ChannelsTableColumns.Channel,
            metricData: {data: null},
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
        [ChannelsTableColumns.TicketsReplied]: {
            column: ChannelsTableColumns.TicketsReplied,
            metricData: data.ticketsRepliedMetricPerChannel,
            idField: CHANNEL_DIMENSION,
            metricField: HelpdeskTicketCount,
        },
        [ChannelsTableColumns.TicketHandleTime]: {
            column: ChannelsTableColumns.TicketHandleTime,
            metricData: data.ticketAverageHandleTimePerChannel,
            idField: CHANNEL_DIMENSION,
            metricField: AverageHandleTime,
        },
    }

    const metricData = [
        columnsOrder.map((column) => ChannelsTableLabels[column]),
        ...channels.map((channel) => {
            return columnsOrder.map((column) =>
                getMetric(column, channel, columnsToMetricDataMap)
            )
        }),
    ]

    return {
        files: {
            [fileName]: createCsv(metricData),
        },
    }
}
