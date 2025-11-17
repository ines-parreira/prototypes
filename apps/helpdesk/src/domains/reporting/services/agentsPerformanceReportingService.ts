import type { User } from 'config/types/user'
import type { Metric } from 'domains/reporting/hooks/metrics'
import type { MetricWithDecile } from 'domains/reporting/hooks/useMetricPerDimension'
import type { AgentTimeTrackingCube } from 'domains/reporting/models/cubes/agentxp/AgentTimeTrackingCube'
import {
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
} from 'domains/reporting/models/cubes/agentxp/AgentTimeTrackingCube'
import type { HandleTimeCube } from 'domains/reporting/models/cubes/agentxp/HandleTimeCube'
import { HandleTimeMeasure } from 'domains/reporting/models/cubes/agentxp/HandleTimeCube'
import type { HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskCustomerMessagesReceivedEnrichedCube'
import { HelpdeskCustomerMessagesReceivedEnrichedMeasure } from 'domains/reporting/models/cubes/HelpdeskCustomerMessagesReceivedEnrichedCube'
import type {
    HelpdeskMessageCubeWithJoins,
    HelpdeskMessageMember,
} from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
} from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMeasure,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketFirstHumanAgentResponseTimeDimension,
    TicketFirstHumanAgentResponseTimeMeasure,
} from 'domains/reporting/models/cubes/TicketFirstHumanAgentResponseTime'
import type { TicketMessagesMember } from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
} from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    TicketMessagesEnrichedResponseTimesDimension,
    TicketMessagesEnrichedResponseTimesMeasure,
} from 'domains/reporting/models/cubes/TicketMessagesEnrichedResponseTimesCube'
import { TicketSatisfactionSurveyMeasure } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import type { TicketsFirstAgentResponseTimeCube } from 'domains/reporting/models/cubes/TicketsFirstAgentResponseTimeCube'
import {
    TicketsFirstAgentResponseTimeDimension,
    TicketsFirstAgentResponseTimeMeasure,
} from 'domains/reporting/models/cubes/TicketsFirstAgentResponseTimeCube'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import {
    AgentsColumnConfig,
    TableLabels,
} from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import {
    AgentsTableColumn,
    AgentsTableRow,
} from 'domains/reporting/state/ui/stats/types'
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
    | TicketMessagesMember.SenderId
    | TicketMessagesEnrichedResponseTimesDimension.TicketMessageUserId
    | TicketFirstHumanAgentResponseTimeDimension.FirstHumanAgentMessageUserId
    | TicketsFirstAgentResponseTimeDimension.FirstAgentMessageUserId

type AgentReportMetrics =
    | HelpdeskMessageCubeWithJoins['dimensions']
    | HelpdeskMessageCubeWithJoins['measures']
    | HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins['measures']
    | AgentTimeTrackingCube['measures']
    | HandleTimeCube['measures']
    | TicketFirstHumanAgentResponseTimeMeasure
    | TicketsFirstAgentResponseTimeCube['measures']

type ReportDataMap = Record<
    AgentsTableColumn,
    {
        column: AgentsTableColumn
        metricData: Pick<MetricWithDecile, 'data'>
        idField: AgentIdentifierDimension
        metricField: AgentReportMetrics
        averageData: number | null | undefined
        totalData: number | null | undefined
    }
>

export interface AgentsPerformanceReportData<T = MetricWithDecile> {
    customerSatisfactionMetric: T
    humanResponseTimeAfterAiHandoffMetric: T
    medianFirstResponseTimeMetric: T
    medianResponseTimeMetric: T
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
    AgentsTableColumn.MessagesReceived,
]

const getTotal = (column: AgentsTableColumn, summaryDataMap: ReportDataMap) => {
    if (column === AgentsTableColumn.AgentName)
        return TOTAL_ROW_AGENT_COLUMN_LABEL

    if (columnsWithTotals.includes(column)) {
        const totalData = summaryDataMap[column].totalData
        return formatMetric(column, totalData)
    }
    return formatMetric(column, null)
}

const getAverage = (
    column: AgentsTableColumn,
    averagesDataMap: ReportDataMap,
    agents: number,
) => {
    if (column === AgentsTableColumn.AgentName)
        return SUMMARY_ROW_AGENT_COLUMN_LABEL

    const summaryData = averagesDataMap[column].averageData
    if (AgentsColumnConfig[column].perAgent && summaryData) {
        return formatMetric(column, summaryData / agents)
    }
    return formatMetric(column, summaryData)
}

const getMetric = (
    column: AgentsTableColumn,
    agent: User,
    summaryDataMap: ReportDataMap,
    shouldIncludeBots?: boolean,
) => {
    if (column === AgentsTableColumn.AgentName) return agent.name
    // Temporary fix for MedianFirstResponseTime should be removed when shouldIncludeBots is deprecated
    if (
        column === AgentsTableColumn.MedianFirstResponseTime &&
        shouldIncludeBots
    )
        return formatMetric(
            column,
            getAgentMetric(
                agent.id,
                summaryDataMap[column].metricData,
                TicketMessagesDimension.FirstHelpdeskMessageUserId,
                TicketMessagesMeasure.MedianFirstResponseTime,
            ),
        )
    return formatMetric(
        column,
        getAgentMetric(
            agent.id,
            summaryDataMap[column].metricData,
            summaryDataMap[column].idField,
            summaryDataMap[column].metricField,
        ),
    )
}

export const getData = (
    agents: User[],
    data: AgentsPerformanceReportData,
    average: Omit<AgentsPerformanceReportData<Metric>, 'agents'>,
    total: Omit<AgentsPerformanceReportData<Metric>, 'agents'>,
    columnsOrder: AgentsTableColumn[],
    rowsOrder: AgentsTableRow[],
    shouldIncludeBots?: boolean,
) => {
    const AssigneeUserId = TicketDimension.AssigneeUserId
    const AvgSurveyScore = TicketSatisfactionSurveyMeasure.AvgSurveyScore
    const MedianResponseTime =
        TicketMessagesEnrichedResponseTimesMeasure.MedianResponseTime
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
    const FirstHumanAgentMessageUserId =
        TicketFirstHumanAgentResponseTimeDimension.FirstHumanAgentMessageUserId
    const MedianFirstHumanAgentResponseTime =
        TicketFirstHumanAgentResponseTimeMeasure.MedianFirstHumanAgentResponseTime

    const columnsToMetricDataMap: ReportDataMap = {
        [AgentsTableColumn.AgentName]: {
            column: AgentsTableColumn.AgentName,
            metricData: { data: null },
            idField: AssigneeUserId,
            metricField: AvgSurveyScore,
            averageData: null,
            totalData: null,
        },
        [AgentsTableColumn.CustomerSatisfaction]: {
            column: AgentsTableColumn.CustomerSatisfaction,
            metricData: data.customerSatisfactionMetric,
            idField: AssigneeUserId,
            metricField: AvgSurveyScore,
            averageData: average.customerSatisfactionMetric.data?.value,
            totalData: total.customerSatisfactionMetric.data?.value,
        },
        [AgentsTableColumn.MedianFirstResponseTime]: {
            column: AgentsTableColumn.MedianFirstResponseTime,
            metricData: data.medianFirstResponseTimeMetric,
            idField:
                TicketsFirstAgentResponseTimeDimension.FirstAgentMessageUserId,
            metricField:
                TicketsFirstAgentResponseTimeMeasure.MedianFirstAgentResponseTime,
            averageData: average.medianFirstResponseTimeMetric.data?.value,
            totalData: total.medianFirstResponseTimeMetric.data?.value,
        },
        [AgentsTableColumn.HumanResponseTimeAfterAiHandoff]: {
            column: AgentsTableColumn.HumanResponseTimeAfterAiHandoff,
            metricData: data.humanResponseTimeAfterAiHandoffMetric,
            idField: FirstHumanAgentMessageUserId,
            metricField: MedianFirstHumanAgentResponseTime,
            averageData:
                average.humanResponseTimeAfterAiHandoffMetric.data?.value,
            totalData: total.humanResponseTimeAfterAiHandoffMetric.data?.value,
        },
        [AgentsTableColumn.MedianResponseTime]: {
            column: AgentsTableColumn.MedianResponseTime,
            metricData: data.medianResponseTimeMetric,
            idField:
                TicketMessagesEnrichedResponseTimesDimension.TicketMessageUserId,
            metricField: MedianResponseTime,
            averageData: average.medianResponseTimeMetric.data?.value,
            totalData: average.medianResponseTimeMetric.data?.value,
        },
        [AgentsTableColumn.MedianResolutionTime]: {
            column: AgentsTableColumn.MedianResolutionTime,
            metricData: data.medianResolutionTimeMetric,
            idField: AssigneeUserId,
            metricField: MedianResolutionTime,
            averageData: average.medianResolutionTimeMetric.data?.value,
            totalData: total.medianResolutionTimeMetric.data?.value,
        },
        [AgentsTableColumn.PercentageOfClosedTickets]: {
            column: AgentsTableColumn.PercentageOfClosedTickets,
            metricData: data.percentageOfClosedTicketsMetric,
            idField: AssigneeUserId,
            metricField: TicketCount,
            averageData: 100,
            totalData: 100,
        },
        [AgentsTableColumn.ClosedTickets]: {
            column: AgentsTableColumn.ClosedTickets,
            metricData: data.closedTicketsMetric,
            idField: AssigneeUserId,
            metricField: TicketCount,
            averageData: average.closedTicketsMetric.data?.value,
            totalData: total.closedTicketsMetric.data?.value,
        },
        [AgentsTableColumn.MessagesSent]: {
            column: AgentsTableColumn.MessagesSent,
            metricData: data.messagesSentMetric,
            idField: SenderId,
            metricField: MessageCount,
            averageData: average.messagesSentMetric.data?.value,
            totalData: total.messagesSentMetric.data?.value,
        },
        [AgentsTableColumn.MessagesReceived]: {
            column: AgentsTableColumn.MessagesReceived,
            metricData: data.messagesReceivedMetric,
            idField: AssigneeUserId,
            metricField: MessageReceivedCount,
            averageData: average.messagesReceivedMetric.data?.value,
            totalData: total.messagesReceivedMetric.data?.value,
        },
        [AgentsTableColumn.RepliedTickets]: {
            column: AgentsTableColumn.RepliedTickets,
            metricData: data.ticketsRepliedMetric,
            idField: MessageSenderId,
            metricField: HelpdeskTicketCount,
            averageData: average.ticketsRepliedMetric.data?.value,
            totalData: total.ticketsRepliedMetric.data?.value,
        },
        [AgentsTableColumn.OneTouchTickets]: {
            column: AgentsTableColumn.OneTouchTickets,
            metricData: data.oneTouchTicketsMetric,
            idField: AssigneeUserId,
            metricField: TicketCount,
            averageData: average.oneTouchTicketsMetric.data?.value,
            totalData: total.oneTouchTicketsMetric.data?.value,
        },
        [AgentsTableColumn.ZeroTouchTickets]: {
            column: AgentsTableColumn.ZeroTouchTickets,
            metricData: data.zeroTouchTicketsMetric,
            idField: AssigneeUserId,
            metricField: TicketCount,
            averageData: average.zeroTouchTicketsMetric.data?.value,
            totalData: total.zeroTouchTicketsMetric.data?.value,
        },
        [AgentsTableColumn.RepliedTicketsPerHour]: {
            column: AgentsTableColumn.RepliedTicketsPerHour,
            metricData: data.repliedTicketsPerHourMetric,
            idField: MessageSenderId,
            metricField: HelpdeskTicketCount,
            averageData: average.repliedTicketsPerHourMetric.data?.value,
            totalData: total.repliedTicketsPerHourMetric.data?.value,
        },
        [AgentsTableColumn.OnlineTime]: {
            column: AgentsTableColumn.OnlineTime,
            metricData: data.onlineTimeMetric,
            idField: UserId,
            metricField: OnlineTime,
            averageData: average.onlineTimeMetric.data?.value,
            totalData: total.onlineTimeMetric.data?.value,
        },
        [AgentsTableColumn.MessagesSentPerHour]: {
            column: AgentsTableColumn.MessagesSentPerHour,
            metricData: data.messagesSentPerHourMetric,
            idField: SenderId,
            metricField: MessageCount,
            averageData: average.messagesSentPerHourMetric.data?.value,
            totalData: total.messagesSentPerHourMetric.data?.value,
        },
        [AgentsTableColumn.ClosedTicketsPerHour]: {
            column: AgentsTableColumn.ClosedTicketsPerHour,
            metricData: data.closedTicketsPerHourMetric,
            idField: AssigneeUserId,
            metricField: TicketCount,
            averageData: average.closedTicketsPerHourMetric.data?.value,
            totalData: total.closedTicketsPerHourMetric.data?.value,
        },
        [AgentsTableColumn.TicketHandleTime]: {
            column: AgentsTableColumn.TicketHandleTime,
            metricData: data.ticketHandleTimeMetric,
            idField: AssigneeUserId,
            metricField: AverageHandleTime,
            averageData: average.ticketHandleTimeMetric.data?.value,
            totalData: total.ticketHandleTimeMetric.data?.value,
        },
    }

    const rowAggregators = {
        [AgentsTableRow.Average]: getAverage,
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
            getMetric(column, agent, columnsToMetricDataMap, shouldIncludeBots),
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
    total: AgentsPerformanceReportData<Metric> | null,
    columnsOrder: AgentsTableColumn[],
    rowsOrder: AgentsTableRow[],
    fileName: string,
    shouldIncludeBots: boolean,
) => {
    if (data === null || summary === null || total === null) {
        return {
            files: {},
        }
    }

    const agentsMetricData = getData(
        agents,
        data,
        summary,
        total,
        columnsOrder,
        rowsOrder,
        shouldIncludeBots,
    )
    return {
        files: {
            [fileName]: createCsv(agentsMetricData),
        },
    }
}
