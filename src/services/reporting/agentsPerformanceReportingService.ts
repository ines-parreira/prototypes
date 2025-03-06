import { User } from 'config/types/user'
import { Metric } from 'hooks/reporting/metrics'
import { MetricWithDecile } from 'hooks/reporting/useMetricPerDimension'
import {
    AgentTimeTrackingCube,
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import {
    HandleTimeCube,
    HandleTimeMeasure,
} from 'models/reporting/cubes/agentxp/HandleTimeCube'
import {
    HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins,
    HelpdeskCustomerMessagesReceivedEnrichedMeasure,
} from 'models/reporting/cubes/HelpdeskCustomerMessagesReceivedEnrichedCube'
import {
    HelpdeskMessageCubeWithJoins,
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
    HelpdeskMessageMember,
} from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMeasure,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
} from 'models/reporting/cubes/TicketMessagesCube'
import { TicketSatisfactionSurveyMeasure } from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {
    AgentsColumnConfig,
    TableLabels,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import { AgentsTableColumn, AgentsTableRow } from 'state/ui/stats/types'
import { createCsv } from 'utils/file'

export const SUMMARY_ROW_AGENT_COLUMN_LABEL = 'Average'
export const TOTAL_ROW_AGENT_COLUMN_LABEL = 'Total'

type AgentIdentifierDimension =
    | TicketDimension.AssigneeUserId
    | TicketMessagesDimension.FirstHelpdeskMessageUserId
    | HelpdeskMessageMember.SenderId
    | HelpdeskMessageDimension.SenderId
    | AgentTimeTrackingDimension.UserId
    | TicketDimension.MessageSenderId

type AgentReportMetrics =
    | HelpdeskMessageCubeWithJoins['dimensions']
    | HelpdeskMessageCubeWithJoins['measures']
    | HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins['measures']
    | AgentTimeTrackingCube['measures']
    | HandleTimeCube['measures']

type ReportDataMap = Record<
    AgentsTableColumn,
    {
        column: AgentsTableColumn
        metricData: Pick<MetricWithDecile, 'data'>
        idField: AgentIdentifierDimension
        metricField: AgentReportMetrics
        summaryData: number | null | undefined
    }
>

export interface AgentsPerformanceReportData<T = MetricWithDecile> {
    customerSatisfactionMetric: T
    medianFirstResponseTimeMetric: T
    medianResolutionTimeMetric: T
    percentageOfClosedTicketsMetric: T
    closedTicketsMetric: T
    ticketsRepliedMetric: T
    messagesSentMetric: T
    messagesReceivedMetric: T
    oneTouchTicketsMetric: T
    zeroTouchTicketsMetric: T
    repliedTicketsPerHourMetric: T
    onlineTimeMetric: T
    messagesSentPerHourMetric: T
    closedTicketsPerHourMetric: T
    ticketHandleTimeMetric: T
}

const formatMetric = (column: AgentsTableColumn, value?: number | null) =>
    formatMetricValue(
        value,
        AgentsColumnConfig[column].format,
        NOT_AVAILABLE_PLACEHOLDER,
    )

const getAgentMetric = (
    agentId: number,
    data: Pick<MetricWithDecile, 'data'>,
    agentIdField: AgentIdentifierDimension,
    metricField: AgentReportMetrics,
) => {
    const metricValue = data.data?.allData.find(
        (item) => Number(item[agentIdField]) === agentId,
    )?.[metricField]
    return typeof metricValue === 'string' ? Number(metricValue) : metricValue
}

const columnsWithTotals = [
    AgentsTableColumn.ClosedTickets,
    AgentsTableColumn.ClosedTicketsPerHour,
    AgentsTableColumn.MessagesSent,
    AgentsTableColumn.MessagesSentPerHour,
    AgentsTableColumn.RepliedTickets,
    AgentsTableColumn.RepliedTicketsPerHour,
]

const getTotal = (column: AgentsTableColumn, summaryDataMap: ReportDataMap) => {
    if (column === AgentsTableColumn.AgentName)
        return TOTAL_ROW_AGENT_COLUMN_LABEL

    if (columnsWithTotals.includes(column)) {
        const summaryData = summaryDataMap[column].summaryData
        return formatMetric(column, summaryData)
    }

    return formatMetric(column, null)
}

const getSummary = (
    column: AgentsTableColumn,
    summaryDataMap: ReportDataMap,
    agents: number,
) => {
    if (column === AgentsTableColumn.AgentName)
        return SUMMARY_ROW_AGENT_COLUMN_LABEL

    const summaryData = summaryDataMap[column].summaryData
    if (AgentsColumnConfig[column].perAgent && summaryData) {
        return formatMetric(column, summaryData / agents)
    }
    return formatMetric(column, summaryData)
}

const getMetric = (
    column: AgentsTableColumn,
    agent: User,
    summaryDataMap: ReportDataMap,
) =>
    column === AgentsTableColumn.AgentName
        ? agent.name
        : formatMetric(
              column,
              getAgentMetric(
                  agent.id,
                  summaryDataMap[column].metricData,
                  summaryDataMap[column].idField,
                  summaryDataMap[column].metricField,
              ),
          )

export const getData = (
    agents: User[],
    data: AgentsPerformanceReportData,
    summary: Omit<AgentsPerformanceReportData<Metric>, 'agents'>,
    columnsOrder: AgentsTableColumn[],
    rowsOrder: AgentsTableRow[],
) => {
    const AssigneeUserId = TicketDimension.AssigneeUserId
    const AvgSurveyScore = TicketSatisfactionSurveyMeasure.AvgSurveyScore
    const FirstHelpdeskMessageUserId =
        TicketMessagesDimension.FirstHelpdeskMessageUserId
    const MedianFirstResponseTime =
        TicketMessagesMeasure.MedianFirstResponseTime
    const MedianResolutionTime = TicketMessagesMeasure.MedianResolutionTime
    const TicketCount = TicketMeasure.TicketCount
    const SenderId = HelpdeskMessageDimension.SenderId
    const MessageSenderId = TicketDimension.MessageSenderId
    const HelpdeskTicketCount = HelpdeskMessageMeasure.TicketCount
    const MessageCount = HelpdeskMessageMeasure.MessageCount
    const MessageReceivedCount =
        HelpdeskCustomerMessagesReceivedEnrichedMeasure.MessageCount
    const OnlineTime = AgentTimeTrackingMeasure.OnlineTime
    const AverageHandleTime = HandleTimeMeasure.AverageHandleTime
    const UserId = AgentTimeTrackingDimension.UserId

    const columnsToMetricDataMap: ReportDataMap = {
        [AgentsTableColumn.AgentName]: {
            column: AgentsTableColumn.AgentName,
            metricData: { data: null },
            idField: AssigneeUserId,
            metricField: AvgSurveyScore,
            summaryData: null,
        },
        [AgentsTableColumn.CustomerSatisfaction]: {
            column: AgentsTableColumn.CustomerSatisfaction,
            metricData: data.customerSatisfactionMetric,
            idField: AssigneeUserId,
            metricField: AvgSurveyScore,
            summaryData: summary.customerSatisfactionMetric.data?.value,
        },
        [AgentsTableColumn.MedianFirstResponseTime]: {
            column: AgentsTableColumn.MedianFirstResponseTime,
            metricData: data.medianFirstResponseTimeMetric,
            idField: FirstHelpdeskMessageUserId,
            metricField: MedianFirstResponseTime,
            summaryData: summary.medianFirstResponseTimeMetric.data?.value,
        },
        [AgentsTableColumn.MedianResolutionTime]: {
            column: AgentsTableColumn.MedianResolutionTime,
            metricData: data.medianResolutionTimeMetric,
            idField: AssigneeUserId,
            metricField: MedianResolutionTime,
            summaryData: summary.medianResolutionTimeMetric.data?.value,
        },
        [AgentsTableColumn.PercentageOfClosedTickets]: {
            column: AgentsTableColumn.PercentageOfClosedTickets,
            metricData: data.percentageOfClosedTicketsMetric,
            idField: AssigneeUserId,
            metricField: TicketCount,
            summaryData: 100,
        },
        [AgentsTableColumn.ClosedTickets]: {
            column: AgentsTableColumn.ClosedTickets,
            metricData: data.closedTicketsMetric,
            idField: AssigneeUserId,
            metricField: TicketCount,
            summaryData: summary.closedTicketsMetric.data?.value,
        },
        [AgentsTableColumn.MessagesSent]: {
            column: AgentsTableColumn.MessagesSent,
            metricData: data.messagesSentMetric,
            idField: SenderId,
            metricField: MessageCount,
            summaryData: summary.messagesSentMetric.data?.value,
        },
        [AgentsTableColumn.MessagesReceived]: {
            column: AgentsTableColumn.MessagesReceived,
            metricData: data.messagesReceivedMetric,
            idField: SenderId,
            metricField: MessageReceivedCount,
            summaryData: summary.messagesReceivedMetric.data?.value,
        },
        [AgentsTableColumn.RepliedTickets]: {
            column: AgentsTableColumn.RepliedTickets,
            metricData: data.ticketsRepliedMetric,
            idField: MessageSenderId,
            metricField: HelpdeskTicketCount,
            summaryData: summary.ticketsRepliedMetric.data?.value,
        },
        [AgentsTableColumn.OneTouchTickets]: {
            column: AgentsTableColumn.OneTouchTickets,
            metricData: data.oneTouchTicketsMetric,
            idField: AssigneeUserId,
            metricField: TicketCount,
            summaryData: summary.oneTouchTicketsMetric.data?.value,
        },
        [AgentsTableColumn.ZeroTouchTickets]: {
            column: AgentsTableColumn.ZeroTouchTickets,
            metricData: data.zeroTouchTicketsMetric,
            idField: AssigneeUserId,
            metricField: TicketCount,
            summaryData: summary.zeroTouchTicketsMetric.data?.value,
        },
        [AgentsTableColumn.RepliedTicketsPerHour]: {
            column: AgentsTableColumn.RepliedTicketsPerHour,
            metricData: data.repliedTicketsPerHourMetric,
            idField: MessageSenderId,
            metricField: HelpdeskTicketCount,
            summaryData: summary.repliedTicketsPerHourMetric.data?.value,
        },
        [AgentsTableColumn.OnlineTime]: {
            column: AgentsTableColumn.OnlineTime,
            metricData: data.onlineTimeMetric,
            idField: UserId,
            metricField: OnlineTime,
            summaryData: summary.onlineTimeMetric.data?.value,
        },
        [AgentsTableColumn.MessagesSentPerHour]: {
            column: AgentsTableColumn.MessagesSentPerHour,
            metricData: data.messagesSentPerHourMetric,
            idField: SenderId,
            metricField: MessageCount,
            summaryData: summary.messagesSentPerHourMetric.data?.value,
        },
        [AgentsTableColumn.ClosedTicketsPerHour]: {
            column: AgentsTableColumn.ClosedTicketsPerHour,
            metricData: data.closedTicketsPerHourMetric,
            idField: AssigneeUserId,
            metricField: TicketCount,
            summaryData: summary.closedTicketsPerHourMetric.data?.value,
        },
        [AgentsTableColumn.TicketHandleTime]: {
            column: AgentsTableColumn.TicketHandleTime,
            metricData: data.ticketHandleTimeMetric,
            idField: AssigneeUserId,
            metricField: AverageHandleTime,
            summaryData: summary.ticketHandleTimeMetric.data?.value,
        },
    }

    const rowAggregators = {
        [AgentsTableRow.Average]: getSummary,
        [AgentsTableRow.Total]: getTotal,
    }

    const aggregationRows = rowsOrder.map((row) => {
        const getAggregatedData = rowAggregators[row]

        return columnsOrder.map((column) => {
            return getAggregatedData(
                column,
                columnsToMetricDataMap,
                agents.length,
            )
        })
    })

    const agentRows = agents.map((agent) => {
        return columnsOrder.map((column) =>
            getMetric(column, agent, columnsToMetricDataMap),
        )
    })

    return [
        columnsOrder.map((column) => TableLabels[column]),
        ...aggregationRows,
        ...agentRows,
    ]
}

export const createAgentsReport = (
    agents: User[],
    data: AgentsPerformanceReportData | null,
    summary: AgentsPerformanceReportData<Metric> | null,
    columnsOrder: AgentsTableColumn[],
    rowsOrder: AgentsTableRow[],
    fileName: string,
) => {
    if (data === null || summary === null) {
        return {
            files: {},
        }
    }

    const agentsMetricData = getData(
        agents,
        data,
        summary,
        columnsOrder,
        rowsOrder,
    )
    return {
        files: {
            [fileName]: createCsv(agentsMetricData),
        },
    }
}
