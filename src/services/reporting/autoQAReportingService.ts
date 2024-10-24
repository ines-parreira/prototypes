import moment from 'moment/moment'

import {User} from 'config/types/user'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {
    TicketQAScoreCubeWithJoins,
    TicketQAScoreMeasure,
} from 'models/reporting/cubes/auto-qa/TicketQAScoreCube'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {Period} from 'models/stat/types'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {
    AutoQAAgentsColumnConfig,
    AutoQAAgentsTableColumn,
    TableLabels,
} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTableConfig'
import {TrendCardConfig} from 'pages/stats/support-performance/auto-qa/AutoQAMetricsConfig'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'
import {AutoQAMetric} from 'state/ui/stats/types'
import {createCsv, saveZippedFiles} from 'utils/file'
import {getPreviousPeriod} from 'utils/reporting'

export type AutoQAReportMetrics =
    | TicketQAScoreCubeWithJoins['dimensions']
    | TicketQAScoreCubeWithJoins['measures']

type ReportDataMap = Record<
    AutoQAAgentsTableColumn,
    {
        column: AutoQAAgentsTableColumn
        metricData: Pick<MetricWithDecile, 'data'>
        idField: string
        metricField: AutoQAReportMetrics
    }
>

export interface AutoQAReportData {
    agents: User[]
    communicationSkillsPerAgent: MetricWithDecile
    communicationSkillsTrend: MetricTrend
    resolutionCompletenessPerAgent: MetricWithDecile
    resolutionCompletenessTrend: MetricTrend
    reviewedClosedTicketsPerAgent: MetricWithDecile
    reviewedClosedTicketsTrend: MetricTrend
}

export const AGENT_ID_DIMENSION = TicketDimension.AssigneeUserId

const formatAgentsColumnMetric = (
    column: AutoQAAgentsTableColumn,
    value?: number | null
) =>
    formatMetricValue(
        value,
        AutoQAAgentsColumnConfig[column].format,
        NOT_AVAILABLE_PLACEHOLDER
    )

const formatTrendMetric = (column: AutoQAMetric, value?: number | null) =>
    formatMetricValue(
        value,
        TrendCardConfig[column].metricFormat,
        NOT_AVAILABLE_PLACEHOLDER
    )

const getAutoQAMetric = (
    agentId: string,
    data: Pick<MetricWithDecile, 'data'>,
    agentIdField: string,
    metricField: AutoQAReportMetrics
) => {
    const metricValue = data.data?.allData.find(
        (item) => item[agentIdField] === agentId
    )?.[metricField]
    return typeof metricValue === 'string' ? Number(metricValue) : metricValue
}

const getMetric = (
    column: AutoQAAgentsTableColumn,
    agent: User,
    summaryDataMap: ReportDataMap
) =>
    column === AutoQAAgentsTableColumn.AgentName
        ? agent.name
        : formatAgentsColumnMetric(
              column,
              getAutoQAMetric(
                  String(agent.id),
                  summaryDataMap[column].metricData,
                  summaryDataMap[column].idField,
                  summaryDataMap[column].metricField
              )
          )

export const saveReport = async (
    data: AutoQAReportData,
    columnsOrder: AutoQAAgentsTableColumn[],
    period: Period
) => {
    const columnsToMetricDataMap: ReportDataMap = {
        [AutoQAAgentsTableColumn.AgentName]: {
            column: AutoQAAgentsTableColumn.AgentName,
            metricData: {data: null},
            idField: AGENT_ID_DIMENSION,
            metricField: TicketQAScoreMeasure.TicketCount,
        },
        [AutoQAAgentsTableColumn.ReviewedClosedTickets]: {
            column: AutoQAAgentsTableColumn.ReviewedClosedTickets,
            metricData: data.reviewedClosedTicketsPerAgent,
            idField: AGENT_ID_DIMENSION,
            metricField: TicketQAScoreMeasure.TicketCount,
        },
        [AutoQAAgentsTableColumn.ResolutionCompleteness]: {
            column: AutoQAAgentsTableColumn.ResolutionCompleteness,
            metricData: data.resolutionCompletenessPerAgent,
            idField: AGENT_ID_DIMENSION,
            metricField: TicketQAScoreMeasure.AverageScore,
        },
        [AutoQAAgentsTableColumn.CommunicationSkills]: {
            column: AutoQAAgentsTableColumn.CommunicationSkills,
            metricData: data.communicationSkillsPerAgent,
            idField: AGENT_ID_DIMENSION,
            metricField: TicketQAScoreMeasure.AverageScore,
        },
    }

    const previousPeriod = getPreviousPeriod(period)
    const export_datetime = moment().format(DATE_TIME_FORMAT)
    const startDate = moment(period.start_datetime).format(DATE_TIME_FORMAT)
    const previousStartDate = moment(previousPeriod.start_datetime).format(
        DATE_TIME_FORMAT
    )
    const endDate = moment(period.end_datetime).format(DATE_TIME_FORMAT)
    const previousEndDate = moment(previousPeriod.end_datetime).format(
        DATE_TIME_FORMAT
    )
    const periodPrefix = `${startDate}_${endDate}`

    const trendData = [
        [
            'Metric',
            `${startDate} - ${endDate}`,
            `${previousStartDate} - ${previousEndDate}`,
        ],
        [
            TrendCardConfig[AutoQAMetric.ReviewedClosedTickets].title,
            formatTrendMetric(
                AutoQAMetric.ReviewedClosedTickets,
                data.reviewedClosedTicketsTrend.data?.value
            ),
            formatTrendMetric(
                AutoQAMetric.ReviewedClosedTickets,
                data.reviewedClosedTicketsTrend.data?.prevValue
            ),
        ],
        [
            TrendCardConfig[AutoQAMetric.ResolutionCompleteness].title,
            formatTrendMetric(
                AutoQAMetric.ResolutionCompleteness,
                data.resolutionCompletenessTrend.data?.value
            ),
            formatTrendMetric(
                AutoQAMetric.ResolutionCompleteness,
                data.resolutionCompletenessTrend.data?.prevValue
            ),
        ],
        [
            TrendCardConfig[AutoQAMetric.CommunicationSkills].title,
            formatTrendMetric(
                AutoQAMetric.CommunicationSkills,
                data.communicationSkillsTrend.data?.value
            ),
            formatTrendMetric(
                AutoQAMetric.CommunicationSkills,
                data.communicationSkillsTrend.data?.prevValue
            ),
        ],
    ]
    const agentsMetricData = [
        columnsOrder.map((column) => TableLabels[column]),
        ...data.agents.map((channel) => {
            return columnsOrder.map((column) =>
                getMetric(column, channel, columnsToMetricDataMap)
            )
        }),
    ]

    return saveZippedFiles(
        {
            [`${periodPrefix}-auto-qa-trends-metrics-${export_datetime}.csv`]:
                createCsv(trendData),
            [`${periodPrefix}-auto-qa-agents-metrics-${export_datetime}.csv`]:
                createCsv(agentsMetricData),
        },
        `${periodPrefix}-auto-qa-metrics-${export_datetime}`
    )
}
