import moment from 'moment/moment'
import {
    HandleTimeCube,
    HandleTimeMeasure,
} from 'models/reporting/cubes/agentxp/HandleTimeCube'
import {
    AgentTimeTrackingCube,
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import {renameMemberEnriched} from 'hooks/reporting/useEnrichedCubes'
import {TicketSatisfactionSurveyMeasure} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
} from 'models/reporting/cubes/TicketMessagesCube'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {Metric} from 'hooks/reporting/metrics'
import {MetricFormat, TableLabels} from 'pages/stats/AgentsTableConfig'
import {User} from 'config/types/user'
import {TableColumn} from 'state/ui/stats/types'
import {createCsv, saveZippedFiles} from 'utils/file'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {TicketDimension, TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {
    HelpdeskMessageCubeWithJoins,
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
    HelpdeskMessageMember,
} from 'models/reporting/cubes/HelpdeskMessageCube'
import {DATE_TIME_FORMAT} from './constants'

export interface Period {
    end_datetime: string
    start_datetime: string
}

type AgentIdentifierDimension =
    | TicketDimension.AssigneeUserId
    | TicketMessagesDimension.FirstHelpdeskMessageUserId
    | HelpdeskMessageMember.SenderId
    | HelpdeskMessageDimension.SenderId
    | AgentTimeTrackingDimension.UserId
type AgentReportMetrics =
    | HelpdeskMessageCubeWithJoins['dimensions']
    | HelpdeskMessageCubeWithJoins['measures']
    | AgentTimeTrackingCube['measures']
    | HandleTimeCube['measures']

type ReportDataMap = Record<
    TableColumn,
    {
        column: TableColumn
        metricData: Pick<MetricWithDecile, 'data'>
        idField: AgentIdentifierDimension
        metricField: AgentReportMetrics
        summaryData: number | null | undefined
    }
>

export interface AgentsPerformanceReportData<T = MetricWithDecile> {
    agents: User[]
    customerSatisfactionMetric: T
    medianFirstResponseTimeMetric: T
    medianResolutionTimeMetric: T
    percentageOfClosedTicketsMetric: T
    closedTicketsMetric: T
    ticketsRepliedMetric: T
    messagesSentMetric: T
    oneTouchTicketsMetric: T
    repliedTicketsPerHourMetric: T
    onlineTimeMetric: T
    messagesSentPerHourMetric: T
    closedTicketsPerHourMetric: T
    ticketHandleTimeMetric: T
}

const formatMetric = (column: TableColumn, value?: number | null) =>
    formatMetricValue(
        value,
        MetricFormat[column].format,
        NOT_AVAILABLE_PLACEHOLDER
    )

const getAgentMetric = (
    agentId: number,
    data: Pick<MetricWithDecile, 'data'>,
    agentIdField: AgentIdentifierDimension,
    metricField: AgentReportMetrics
) => {
    const metricValue = data.data?.allData.find(
        (item) => Number(item[agentIdField]) === agentId
    )?.[metricField]

    return typeof metricValue === 'string' ? Number(metricValue) : metricValue
}

const getSummary = (
    column: TableColumn,
    summaryDataMap: ReportDataMap,
    agents: number
) => {
    const summaryData = summaryDataMap[column].summaryData
    if (MetricFormat[column].perAgent && summaryData) {
        return summaryData / agents
    }
    return formatMetric(column, summaryData)
}

export const saveReport = async (
    data: AgentsPerformanceReportData,
    summary: Omit<AgentsPerformanceReportData<Metric>, 'agents'>,
    columnsOrder: TableColumn[],
    useEnrichedCubes: boolean,
    period?: Period
) => {
    const AssigneeUserId = TicketDimension.AssigneeUserId
    const EnrichedAssigneeUserId = useEnrichedCubes
        ? renameMemberEnriched(TicketDimension.AssigneeUserId)
        : TicketDimension.AssigneeUserId
    const AvgSurveyScore = useEnrichedCubes
        ? renameMemberEnriched(TicketSatisfactionSurveyMeasure.AvgSurveyScore)
        : TicketSatisfactionSurveyMeasure.AvgSurveyScore
    const FirstHelpdeskMessageUserId = useEnrichedCubes
        ? renameMemberEnriched(
              TicketMessagesDimension.FirstHelpdeskMessageUserId
          )
        : TicketMessagesDimension.FirstHelpdeskMessageUserId
    const MedianFirstResponseTime = useEnrichedCubes
        ? renameMemberEnriched(TicketMessagesMeasure.MedianFirstResponseTime)
        : TicketMessagesMeasure.MedianFirstResponseTime
    const MedianResolutionTime = useEnrichedCubes
        ? renameMemberEnriched(TicketMessagesMeasure.MedianResolutionTime)
        : TicketMessagesMeasure.MedianResolutionTime
    const TicketCount = useEnrichedCubes
        ? renameMemberEnriched(TicketMeasure.TicketCount)
        : TicketMeasure.TicketCount
    const SenderId = useEnrichedCubes
        ? renameMemberEnriched(HelpdeskMessageDimension.SenderId)
        : HelpdeskMessageDimension.SenderId
    const HelpdeskTicketCount = useEnrichedCubes
        ? renameMemberEnriched(HelpdeskMessageMeasure.TicketCount)
        : HelpdeskMessageMeasure.TicketCount
    const MessageCount = useEnrichedCubes
        ? renameMemberEnriched(HelpdeskMessageMeasure.MessageCount)
        : HelpdeskMessageMeasure.MessageCount
    const OnlineTime = AgentTimeTrackingMeasure.OnlineTime
    const AverageHandleTime = HandleTimeMeasure.AverageHandleTime
    const UserId = useEnrichedCubes
        ? renameMemberEnriched(AgentTimeTrackingDimension.UserId)
        : AgentTimeTrackingDimension.UserId

    const getGenericMetric = (
        column: TableColumn,
        agent: User,
        summaryDataMap: ReportDataMap
    ) =>
        formatMetric(
            column,
            getAgentMetric(
                agent.id,
                summaryDataMap[column].metricData,
                summaryDataMap[column].idField,
                summaryDataMap[column].metricField
            )
        )

    const columnsToMetricDataMap: ReportDataMap = {
        [TableColumn.AgentName]: {
            column: TableColumn.AgentName,
            metricData: {data: null},
            idField: EnrichedAssigneeUserId,
            metricField: AvgSurveyScore,
            summaryData: null,
        },
        [TableColumn.CustomerSatisfaction]: {
            column: TableColumn.CustomerSatisfaction,
            metricData: data.customerSatisfactionMetric,
            idField: EnrichedAssigneeUserId,
            metricField: AvgSurveyScore,
            summaryData: summary.customerSatisfactionMetric.data?.value,
        },
        [TableColumn.MedianFirstResponseTime]: {
            column: TableColumn.MedianFirstResponseTime,
            metricData: data.medianFirstResponseTimeMetric,
            idField: FirstHelpdeskMessageUserId,
            metricField: MedianFirstResponseTime,
            summaryData: summary.medianFirstResponseTimeMetric.data?.value,
        },
        [TableColumn.MedianResolutionTime]: {
            column: TableColumn.MedianResolutionTime,
            metricData: data.medianResolutionTimeMetric,
            idField: EnrichedAssigneeUserId,
            metricField: MedianResolutionTime,
            summaryData: summary.medianResolutionTimeMetric.data?.value,
        },
        [TableColumn.PercentageOfClosedTickets]: {
            column: TableColumn.PercentageOfClosedTickets,
            metricData: data.percentageOfClosedTicketsMetric,
            idField: EnrichedAssigneeUserId,
            metricField: TicketCount,
            summaryData: 100,
        },
        [TableColumn.ClosedTickets]: {
            column: TableColumn.ClosedTickets,
            metricData: data.closedTicketsMetric,
            idField: EnrichedAssigneeUserId,
            metricField: TicketCount,
            summaryData: summary.closedTicketsMetric.data?.value,
        },
        [TableColumn.MessagesSent]: {
            column: TableColumn.MessagesSent,
            metricData: data.messagesSentMetric,
            idField: SenderId,
            metricField: MessageCount,
            summaryData: summary.messagesSentMetric.data?.value,
        },
        [TableColumn.RepliedTickets]: {
            column: TableColumn.RepliedTickets,
            metricData: data.ticketsRepliedMetric,
            idField: SenderId,
            metricField: HelpdeskTicketCount,
            summaryData: summary.ticketsRepliedMetric.data?.value,
        },
        [TableColumn.OneTouchTickets]: {
            column: TableColumn.OneTouchTickets,
            metricData: data.oneTouchTicketsMetric,
            idField: EnrichedAssigneeUserId,
            metricField: TicketCount,
            summaryData: summary.oneTouchTicketsMetric.data?.value,
        },
        [TableColumn.RepliedTicketsPerHour]: {
            column: TableColumn.RepliedTicketsPerHour,
            metricData: data.repliedTicketsPerHourMetric,
            idField: SenderId,
            metricField: HelpdeskTicketCount,
            summaryData: summary.repliedTicketsPerHourMetric.data?.value,
        },
        [TableColumn.OnlineTime]: {
            column: TableColumn.OnlineTime,
            metricData: data.onlineTimeMetric,
            idField: UserId,
            metricField: OnlineTime,
            summaryData: summary.onlineTimeMetric.data?.value,
        },
        [TableColumn.MessagesSentPerHour]: {
            column: TableColumn.MessagesSentPerHour,
            metricData: data.messagesSentPerHourMetric,
            idField: SenderId,
            metricField: MessageCount,
            summaryData: summary.messagesSentPerHourMetric.data?.value,
        },
        [TableColumn.ClosedTicketsPerHour]: {
            column: TableColumn.ClosedTicketsPerHour,
            metricData: data.closedTicketsPerHourMetric,
            idField: EnrichedAssigneeUserId,
            metricField: TicketCount,
            summaryData: summary.closedTicketsPerHourMetric.data?.value,
        },
        [TableColumn.TicketHandleTime]: {
            column: TableColumn.TicketHandleTime,
            metricData: data.ticketHandleTimeMetric,
            idField: AssigneeUserId,
            metricField: AverageHandleTime,
            summaryData: summary.ticketHandleTimeMetric.data?.value,
        },
    }

    const agentsMetricData = [
        columnsOrder.map((column) => TableLabels[column]),
        columnsOrder.map((column) =>
            getSummary(column, columnsToMetricDataMap, data.agents.length)
        ),
        ...data.agents.map((agent) => {
            return columnsOrder.map((column) =>
                getGenericMetric(column, agent, columnsToMetricDataMap)
            )
        }),
    ]

    const export_datetime = moment().format(DATE_TIME_FORMAT)
    const startDate = moment(period?.start_datetime).format(DATE_TIME_FORMAT)
    const endDate = moment(period?.end_datetime).format(DATE_TIME_FORMAT)
    const periodPrefix = `${startDate}_${endDate}`

    return saveZippedFiles(
        {
            [`${periodPrefix}-agents-metrics-${export_datetime}.csv`]:
                createCsv(agentsMetricData),
        },
        `${periodPrefix}-agents-metrics-${export_datetime}`
    )
}
