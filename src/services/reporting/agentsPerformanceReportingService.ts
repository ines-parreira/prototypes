import moment from 'moment/moment'
import {renameMemberEnriched} from 'hooks/reporting/useEnrichedCubes'
import {TicketSatisfactionSurveyMeasure} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
} from 'models/reporting/cubes/TicketMessagesCube'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {Metric} from 'hooks/reporting/metrics'
import {TableLabels} from 'pages/stats/AgentsTableConfig'
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
}

const formatMetric = {
    decimal: (value?: number | null) =>
        formatMetricValue(value, 'decimal', NOT_AVAILABLE_PLACEHOLDER),
    percent: (value?: number | null) =>
        formatMetricValue(value, 'percent', NOT_AVAILABLE_PLACEHOLDER),
}

const getAgentMetric = (
    agentId: number,
    data: MetricWithDecile,
    agentIdField:
        | TicketDimension.AssigneeUserId
        | TicketMessagesDimension.FirstHelpdeskMessageUserId
        | HelpdeskMessageMember.SenderId
        | HelpdeskMessageDimension.SenderId,
    metricField: `${
        | HelpdeskMessageCubeWithJoins['dimensions']
        | HelpdeskMessageCubeWithJoins['measures']}`
) => {
    const metricValue = (
        data.data?.allData as {
            [Property in
                | HelpdeskMessageCubeWithJoins['dimensions']
                | HelpdeskMessageCubeWithJoins['measures']]: string
        }[]
    ).find((item) => Number(item[agentIdField]) === agentId)?.[metricField]

    return typeof metricValue === 'string' ? Number(metricValue) : metricValue
}

export const saveReport = async (
    data: AgentsPerformanceReportData,
    summary: Omit<AgentsPerformanceReportData<Metric>, 'agents'>,
    useEnrichedCubes: boolean,
    period?: Period
) => {
    const {
        agents,
        customerSatisfactionMetric,
        medianFirstResponseTimeMetric,
        medianResolutionTimeMetric,
        closedTicketsMetric,
        percentageOfClosedTicketsMetric,
        ticketsRepliedMetric,
        messagesSentMetric,
        oneTouchTicketsMetric,
    } = data

    const AssigneeUserId = useEnrichedCubes
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

    const getCustomerSatisfactionAgentMetric = (agentId: number) =>
        formatMetric.decimal(
            getAgentMetric(
                agentId,
                customerSatisfactionMetric,
                AssigneeUserId,
                AvgSurveyScore
            )
        )

    const getMedianFirstResponseTimeAgentMetric = (agentId: number) =>
        getAgentMetric(
            agentId,
            medianFirstResponseTimeMetric,
            FirstHelpdeskMessageUserId,
            MedianFirstResponseTime
        ) || NOT_AVAILABLE_PLACEHOLDER

    const getMedianResolutionTimeAgentMetric = (agentId: number) =>
        getAgentMetric(
            agentId,
            medianResolutionTimeMetric,
            AssigneeUserId,
            MedianResolutionTime
        ) || NOT_AVAILABLE_PLACEHOLDER

    const getClosedTicketsMetricAgentMetric = (agentId: number) =>
        formatMetric.decimal(
            getAgentMetric(
                agentId,
                closedTicketsMetric,
                AssigneeUserId,
                TicketCount
            )
        )

    const getPercentageOfClosedTicketsAgentMetric = (agentId: number) =>
        formatMetric.percent(
            getAgentMetric(
                agentId,
                percentageOfClosedTicketsMetric,
                AssigneeUserId,
                TicketCount
            )
        )

    const getTicketsRepliedAgentMetric = (agentId: number) =>
        formatMetric.decimal(
            getAgentMetric(
                agentId,
                ticketsRepliedMetric,
                SenderId,
                HelpdeskTicketCount
            )
        )

    const getMessagesSentAgentMetric = (agentId: number) =>
        formatMetric.decimal(
            getAgentMetric(agentId, messagesSentMetric, SenderId, MessageCount)
        )

    const getOneTouchTicketsAgentMetric = (agentId: number) =>
        formatMetric.percent(
            getAgentMetric(
                agentId,
                oneTouchTicketsMetric,
                AssigneeUserId,
                TicketCount
            )
        )

    const agentsMetricData = [
        [
            TableLabels[TableColumn.AgentName],
            TableLabels[TableColumn.CustomerSatisfaction],
            TableLabels[TableColumn.MedianFirstResponseTime],
            TableLabels[TableColumn.MedianResolutionTime],
            TableLabels[TableColumn.ClosedTickets],
            TableLabels[TableColumn.PercentageOfClosedTickets],
            TableLabels[TableColumn.RepliedTickets],
            TableLabels[TableColumn.MessagesSent],
            TableLabels[TableColumn.OneTouchTickets],
        ],
        [
            'Average',
            formatMetric.decimal(
                summary.customerSatisfactionMetric.data?.value
            ),
            summary.medianFirstResponseTimeMetric.data?.value,
            summary.medianResolutionTimeMetric.data?.value,
            formatMetric.decimal(
                summary.closedTicketsMetric.data?.value
                    ? summary.closedTicketsMetric.data.value / agents.length
                    : summary.closedTicketsMetric.data?.value
            ),
            formatMetric.percent(100 / agents.length),
            formatMetric.decimal(
                summary.ticketsRepliedMetric.data?.value
                    ? summary.ticketsRepliedMetric.data.value / agents.length
                    : summary.ticketsRepliedMetric.data?.value
            ),
            formatMetric.decimal(
                summary.messagesSentMetric.data?.value
                    ? summary.messagesSentMetric.data.value / agents.length
                    : summary.messagesSentMetric.data?.value
            ),
            formatMetric.percent(
                summary.oneTouchTicketsMetric.data?.value
                    ? summary.oneTouchTicketsMetric.data.value / agents.length
                    : summary.oneTouchTicketsMetric.data?.value
            ),
        ],
        ...agents.map((agent) => {
            return [
                agent.name,
                getCustomerSatisfactionAgentMetric(agent.id),
                getMedianFirstResponseTimeAgentMetric(agent.id),
                getMedianResolutionTimeAgentMetric(agent.id),
                getClosedTicketsMetricAgentMetric(agent.id),
                getPercentageOfClosedTicketsAgentMetric(agent.id),
                getTicketsRepliedAgentMetric(agent.id),
                getMessagesSentAgentMetric(agent.id),
                getOneTouchTicketsAgentMetric(agent.id),
            ]
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
