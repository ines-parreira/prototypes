import moment from 'moment/moment'
import {TicketSatisfactionSurveyMeasure} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
} from 'models/reporting/cubes/TicketMessagesCube'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {Metric} from 'hooks/reporting/metrics'
import {TableLabels} from 'pages/stats/TableConfig'
import {User} from 'config/types/user'
import {createCsv, saveZippedFiles} from 'utils/file'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {TicketDimension, TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {
    HelpdeskMessageCubeWithJoins,
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
    firstResponseTimeMetric: T
    resolutionTimeMetric: T
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

export const saveReport = async (
    data: AgentsPerformanceReportData<MetricWithDecile>,
    summary: Omit<AgentsPerformanceReportData<Metric>, 'agents'>,
    period?: Period
) => {
    const {
        agents,
        customerSatisfactionMetric,
        firstResponseTimeMetric,
        resolutionTimeMetric,
        closedTicketsMetric,
        percentageOfClosedTicketsMetric,
        ticketsRepliedMetric,
        messagesSentMetric,
        oneTouchTicketsMetric,
    } = data

    const getAgentMetric = (
        agentId: number,
        data: MetricWithDecile,
        accessItem: `${
            | HelpdeskMessageCubeWithJoins['dimensions']
            | HelpdeskMessageCubeWithJoins['measures']}`
    ) => {
        const metricValue = (
            data.data?.allData as {
                [Property in
                    | HelpdeskMessageCubeWithJoins['dimensions']
                    | HelpdeskMessageCubeWithJoins['measures']]: string
            }[]
        ).find(
            (item) =>
                Number(item[TicketDimension.AssigneeUserId]) === agentId ||
                Number(
                    item[TicketMessagesDimension.FirstHelpdeskMessageUserId]
                ) === agentId ||
                Number(item[HelpdeskMessageMember.SenderId]) === agentId
        )?.[accessItem]

        return typeof metricValue === 'string'
            ? Number(metricValue)
            : metricValue
    }

    const getCustomerSatisfactionAgentMetric = (agentId: number) =>
        formatMetric.decimal(
            getAgentMetric(
                agentId,
                customerSatisfactionMetric,
                TicketSatisfactionSurveyMeasure.SurveyScore
            )
        )

    const getFirstResponseTimeAgentMetric = (agentId: number) =>
        getAgentMetric(
            agentId,
            firstResponseTimeMetric,
            TicketMessagesMeasure.FirstResponseTime
        ) || NOT_AVAILABLE_PLACEHOLDER

    const getResolutionTimeAgentMetric = (agentId: number) =>
        getAgentMetric(
            agentId,
            resolutionTimeMetric,
            TicketMessagesMeasure.ResolutionTime
        ) || NOT_AVAILABLE_PLACEHOLDER

    const getClosedTicketsMetricAgentMetric = (agentId: number) =>
        formatMetric.decimal(
            getAgentMetric(
                agentId,
                closedTicketsMetric,
                TicketMeasure.TicketCount
            )
        )

    const getPercentageOfClosedTicketsAgentMetric = (agentId: number) =>
        formatMetric.percent(
            getAgentMetric(
                agentId,
                percentageOfClosedTicketsMetric,
                TicketMeasure.TicketCount
            )
        )

    const getTicketsRepliedAgentMetric = (agentId: number) =>
        formatMetric.decimal(
            getAgentMetric(
                agentId,
                ticketsRepliedMetric,
                HelpdeskMessageMeasure.TicketCount
            )
        )

    const getMessagesSentAgentMetric = (agentId: number) =>
        formatMetric.decimal(
            getAgentMetric(
                agentId,
                messagesSentMetric,
                HelpdeskMessageMeasure.MessageCount
            )
        )

    const getOneTouchTicketsAgentMetric = (agentId: number) =>
        formatMetric.percent(
            getAgentMetric(
                agentId,
                oneTouchTicketsMetric,
                TicketMeasure.TicketCount
            )
        )

    const agentsMetricData = [
        [
            TableLabels.agent_name,
            TableLabels.customer_satisfaction,
            TableLabels.first_response_time,
            TableLabels.resolution_time,
            TableLabels.closed_tickets,
            TableLabels.percentage_of_closed_tickets,
            TableLabels.replied_tickets,
            TableLabels.messages_sent,
            TableLabels.one_touch_tickets,
        ],
        [
            'Average',
            formatMetric.decimal(
                summary.customerSatisfactionMetric.data?.value
            ),
            summary.firstResponseTimeMetric.data?.value,
            summary.resolutionTimeMetric.data?.value,
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
                getFirstResponseTimeAgentMetric(agent.id),
                getResolutionTimeAgentMetric(agent.id),
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
