import type { User } from 'config/types/user'
import type { Metric } from 'domains/reporting/hooks/metrics'
import type { MetricWithDecile } from 'domains/reporting/hooks/types'
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

type ReportDataMap = Record<
    AgentsTableColumn,
    {
        column: AgentsTableColumn
        metricData: Pick<MetricWithDecile, 'data'>
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
    agentId: string | number,
    data: Pick<MetricWithDecile, 'data'>,
) => {
    if (!data.data) return null
    const metricData = data.data
    const firstDimension = metricData.dimensions?.[0] || ''
    const firstMeasure = metricData.measures?.[0] || ''
    const metricValue = metricData.allData.find(
        (item) => item[firstDimension]?.toString() === agentId.toString(),
    )?.[firstMeasure]
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
) => {
    if (column === AgentsTableColumn.AgentName) return agent.name
    return formatMetric(
        column,
        getAgentMetric(agent.id, summaryDataMap[column].metricData),
    )
}

export const getData = (
    agents: User[],
    data: AgentsPerformanceReportData,
    average: Omit<AgentsPerformanceReportData<Metric>, 'agents'>,
    total: Omit<AgentsPerformanceReportData<Metric>, 'agents'>,
    columnsOrder: AgentsTableColumn[],
    rowsOrder: AgentsTableRow[],
) => {
    const columnsToMetricDataMap: ReportDataMap = {
        [AgentsTableColumn.AgentName]: {
            column: AgentsTableColumn.AgentName,
            metricData: { data: null },
            averageData: null,
            totalData: null,
        },
        [AgentsTableColumn.CustomerSatisfaction]: {
            column: AgentsTableColumn.CustomerSatisfaction,
            metricData: data.customerSatisfactionMetric,
            averageData: average.customerSatisfactionMetric.data?.value,
            totalData: total.customerSatisfactionMetric.data?.value,
        },
        [AgentsTableColumn.MedianFirstResponseTime]: {
            column: AgentsTableColumn.MedianFirstResponseTime,
            metricData: data.medianFirstResponseTimeMetric,
            averageData: average.medianFirstResponseTimeMetric.data?.value,
            totalData: total.medianFirstResponseTimeMetric.data?.value,
        },
        [AgentsTableColumn.HumanResponseTimeAfterAiHandoff]: {
            column: AgentsTableColumn.HumanResponseTimeAfterAiHandoff,
            metricData: data.humanResponseTimeAfterAiHandoffMetric,
            averageData:
                average.humanResponseTimeAfterAiHandoffMetric.data?.value,
            totalData: total.humanResponseTimeAfterAiHandoffMetric.data?.value,
        },
        [AgentsTableColumn.MedianResponseTime]: {
            column: AgentsTableColumn.MedianResponseTime,
            metricData: data.medianResponseTimeMetric,
            averageData: average.medianResponseTimeMetric.data?.value,
            totalData: average.medianResponseTimeMetric.data?.value,
        },
        [AgentsTableColumn.MedianResolutionTime]: {
            column: AgentsTableColumn.MedianResolutionTime,
            metricData: data.medianResolutionTimeMetric,
            averageData: average.medianResolutionTimeMetric.data?.value,
            totalData: total.medianResolutionTimeMetric.data?.value,
        },
        [AgentsTableColumn.PercentageOfClosedTickets]: {
            column: AgentsTableColumn.PercentageOfClosedTickets,
            metricData: data.percentageOfClosedTicketsMetric,
            averageData: 100,
            totalData: 100,
        },
        [AgentsTableColumn.ClosedTickets]: {
            column: AgentsTableColumn.ClosedTickets,
            metricData: data.closedTicketsMetric,
            averageData: average.closedTicketsMetric.data?.value,
            totalData: total.closedTicketsMetric.data?.value,
        },
        [AgentsTableColumn.MessagesSent]: {
            column: AgentsTableColumn.MessagesSent,
            metricData: data.messagesSentMetric,
            averageData: average.messagesSentMetric.data?.value,
            totalData: total.messagesSentMetric.data?.value,
        },
        [AgentsTableColumn.MessagesReceived]: {
            column: AgentsTableColumn.MessagesReceived,
            metricData: data.messagesReceivedMetric,
            averageData: average.messagesReceivedMetric.data?.value,
            totalData: total.messagesReceivedMetric.data?.value,
        },
        [AgentsTableColumn.RepliedTickets]: {
            column: AgentsTableColumn.RepliedTickets,
            metricData: data.ticketsRepliedMetric,
            averageData: average.ticketsRepliedMetric.data?.value,
            totalData: total.ticketsRepliedMetric.data?.value,
        },
        [AgentsTableColumn.OneTouchTickets]: {
            column: AgentsTableColumn.OneTouchTickets,
            metricData: data.oneTouchTicketsMetric,
            averageData: average.oneTouchTicketsMetric.data?.value,
            totalData: total.oneTouchTicketsMetric.data?.value,
        },
        [AgentsTableColumn.ZeroTouchTickets]: {
            column: AgentsTableColumn.ZeroTouchTickets,
            metricData: data.zeroTouchTicketsMetric,
            averageData: average.zeroTouchTicketsMetric.data?.value,
            totalData: total.zeroTouchTicketsMetric.data?.value,
        },
        [AgentsTableColumn.RepliedTicketsPerHour]: {
            column: AgentsTableColumn.RepliedTicketsPerHour,
            metricData: data.repliedTicketsPerHourMetric,
            averageData: average.repliedTicketsPerHourMetric.data?.value,
            totalData: total.repliedTicketsPerHourMetric.data?.value,
        },
        [AgentsTableColumn.OnlineTime]: {
            column: AgentsTableColumn.OnlineTime,
            metricData: data.onlineTimeMetric,
            averageData: average.onlineTimeMetric.data?.value,
            totalData: total.onlineTimeMetric.data?.value,
        },
        [AgentsTableColumn.MessagesSentPerHour]: {
            column: AgentsTableColumn.MessagesSentPerHour,
            metricData: data.messagesSentPerHourMetric,
            averageData: average.messagesSentPerHourMetric.data?.value,
            totalData: total.messagesSentPerHourMetric.data?.value,
        },
        [AgentsTableColumn.ClosedTicketsPerHour]: {
            column: AgentsTableColumn.ClosedTicketsPerHour,
            metricData: data.closedTicketsPerHourMetric,
            averageData: average.closedTicketsPerHourMetric.data?.value,
            totalData: total.closedTicketsPerHourMetric.data?.value,
        },
        [AgentsTableColumn.TicketHandleTime]: {
            column: AgentsTableColumn.TicketHandleTime,
            metricData: data.ticketHandleTimeMetric,
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
    total: AgentsPerformanceReportData<Metric> | null,
    columnsOrder: AgentsTableColumn[],
    rowsOrder: AgentsTableRow[],
    fileName: string,
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
    )
    return {
        files: {
            [fileName]: createCsv(agentsMetricData),
        },
    }
}
