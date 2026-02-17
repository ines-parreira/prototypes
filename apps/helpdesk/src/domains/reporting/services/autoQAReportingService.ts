import { createCsv } from '@repo/utils'
import moment from 'moment/moment'

import type { User } from 'config/types/user'
import type { TableDataSources } from 'domains/reporting/hooks/common/useTableReportData'
import { fetchTableReportData } from 'domains/reporting/hooks/common/useTableReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { fetchAccuracyPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useAccuracyPerAgent'
import { useAutoQAMetrics } from 'domains/reporting/hooks/support-performance/auto-qa/useAutoQAMetrics'
import { fetchBrandVoicePerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useBrandVoicePerAgent'
import { fetchCommunicationSkillsPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useCommunicationSkillsPerAgent'
import { fetchEfficiencyPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useEfficiencyPerAgent'
import { fetchInternalCompliancePerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useInternalCompliancePerAgent'
import { fetchLanguageProficiencyPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useLanguageProficiencyPerAgent'
import { fetchResolutionCompletenessPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useResolutionCompletenessPerAgent'
import { fetchReviewedClosedTicketsPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useReviewedClosedTicketsPerAgent'
import type { MetricWithDecile } from 'domains/reporting/hooks/types'
import type { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import type { TicketQAScoreCubeWithJoins } from 'domains/reporting/models/cubes/auto-qa/TicketQAScoreCube'
import { TicketQAScoreMeasure } from 'domains/reporting/models/cubes/auto-qa/TicketQAScoreCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import type { Period, StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import {
    AUTO_QA_AGENTS_TABLE_DIMENSIONS_COLUMNS_ORDER,
    AutoQAAgentsColumnConfig,
    AutoQAAgentsTableColumn,
    TableLabels,
} from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentsTableConfig'
import { TrendCardConfig } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAMetricsConfig'
import { DATE_TIME_FORMAT } from 'domains/reporting/services/constants'
import { getSortedAutoQAAgents } from 'domains/reporting/state/ui/stats/autoQAAgentPerformanceSlice'
import type { TicketInsightsOrder } from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import { AutoQAMetric } from 'domains/reporting/state/ui/stats/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import useAppSelector from 'hooks/useAppSelector'

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

export interface AutoQATableReportData {
    communicationSkillsPerAgent: MetricWithDecile
    resolutionCompletenessPerAgent: MetricWithDecile
    reviewedClosedTicketsPerAgent: MetricWithDecile
    languageProficiencyPerAgent: MetricWithDecile
    accuracyPerAgent: MetricWithDecile
    efficiencyPerAgent: MetricWithDecile
    internalCompliancePerAgent: MetricWithDecile
    brandVoicePerAgent: MetricWithDecile
}

export interface AutoQATrendReportData {
    communicationSkillsTrend: MetricTrend
    resolutionCompletenessTrend: MetricTrend
    reviewedClosedTicketsTrend: MetricTrend
    languageProficiencyTrend: MetricTrend
    accuracyTrend: MetricTrend
    efficiencyTrend: MetricTrend
    internalComplianceTrend: MetricTrend
    brandVoiceTrend: MetricTrend
}

export type AutoQAReportData = AutoQATableReportData & AutoQATrendReportData

export const AGENT_ID_DIMENSION = TicketDimension.AssigneeUserId
export const AUTO_QA_DOWNLOAD_DATA_FILE_NAME = 'auto-qa-metrics'
export const AUTO_QA_DOWNLOAD_TRENDS_FILE_NAME = 'auto-qa-trends-metrics'
export const AUTO_QA_DOWNLOAD_AGENTS_FILE_NAME = 'auto-qa-agents-metrics'

const formatAgentsColumnMetric = (
    column: AutoQAAgentsTableColumn,
    value?: number | null,
) =>
    formatMetricValue(
        value,
        AutoQAAgentsColumnConfig[column].format,
        NOT_AVAILABLE_PLACEHOLDER,
    )

const formatTrendMetric = (column: AutoQAMetric, value?: number | null) =>
    formatMetricValue(
        value,
        TrendCardConfig[column].metricFormat,
        NOT_AVAILABLE_PLACEHOLDER,
    )

const getAutoQAMetric = (
    agentId: string,
    data: Pick<MetricWithDecile, 'data'>,
    agentIdField: string,
    metricField: AutoQAReportMetrics,
) => {
    const metricValue = data.data?.allData.find(
        (item) => item[agentIdField] === agentId,
    )?.[metricField]
    return typeof metricValue === 'string' ? Number(metricValue) : metricValue
}

const getMetric = (
    column: AutoQAAgentsTableColumn,
    agent: User,
    summaryDataMap: ReportDataMap,
) =>
    column === AutoQAAgentsTableColumn.AgentName
        ? agent.name
        : formatAgentsColumnMetric(
              column,
              getAutoQAMetric(
                  String(agent.id),
                  summaryDataMap[column].metricData,
                  summaryDataMap[column].idField,
                  summaryDataMap[column].metricField,
              ),
          )

const createTableReport = (
    agents: User[],
    data: AutoQATableReportData,
    columnsOrder: AutoQAAgentsTableColumn[],
    period: Period,
) => {
    const columnsToMetricDataMap: ReportDataMap = {
        [AutoQAAgentsTableColumn.AgentName]: {
            column: AutoQAAgentsTableColumn.AgentName,
            metricData: { data: null },
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
            metricField:
                TicketQAScoreMeasure.AverageResolutionCompletenessScore,
        },
        [AutoQAAgentsTableColumn.Accuracy]: {
            column: AutoQAAgentsTableColumn.Accuracy,
            metricData: data.accuracyPerAgent,
            idField: AGENT_ID_DIMENSION,
            metricField: TicketQAScoreMeasure.AverageAccuracyScore,
        },
        [AutoQAAgentsTableColumn.InternalCompliance]: {
            column: AutoQAAgentsTableColumn.InternalCompliance,
            metricData: data.internalCompliancePerAgent,
            idField: AGENT_ID_DIMENSION,
            metricField: TicketQAScoreMeasure.AverageInternalComplianceScore,
        },
        [AutoQAAgentsTableColumn.Efficiency]: {
            column: AutoQAAgentsTableColumn.Efficiency,
            metricData: data.efficiencyPerAgent,
            idField: AGENT_ID_DIMENSION,
            metricField: TicketQAScoreMeasure.AverageEfficiencyScore,
        },
        [AutoQAAgentsTableColumn.CommunicationSkills]: {
            column: AutoQAAgentsTableColumn.CommunicationSkills,
            metricData: data.communicationSkillsPerAgent,
            idField: AGENT_ID_DIMENSION,
            metricField: TicketQAScoreMeasure.AverageCommunicationSkillsScore,
        },
        [AutoQAAgentsTableColumn.LanguageProficiency]: {
            column: AutoQAAgentsTableColumn.LanguageProficiency,
            metricData: data.languageProficiencyPerAgent,
            idField: AGENT_ID_DIMENSION,
            metricField: TicketQAScoreMeasure.AverageLanguageProficiencyScore,
        },
        [AutoQAAgentsTableColumn.BrandVoice]: {
            column: AutoQAAgentsTableColumn.BrandVoice,
            metricData: data.brandVoicePerAgent,
            idField: AGENT_ID_DIMENSION,
            metricField: TicketQAScoreMeasure.AverageBrandVoiceScore,
        },
    }

    const agentsMetricData = [
        columnsOrder.map((column) => TableLabels[column]),
        ...agents.map((channel) => {
            return columnsOrder.map((column) =>
                getMetric(column, channel, columnsToMetricDataMap),
            )
        }),
    ]

    return {
        files: {
            [getCsvFileNameWithDates(
                period,
                AUTO_QA_DOWNLOAD_AGENTS_FILE_NAME,
            )]: createCsv(agentsMetricData),
        },
    }
}

const createTrendReport = (data: AutoQAReportData, period: Period) => {
    const previousPeriod = getPreviousPeriod(period)
    const startDate = moment(period.start_datetime).format(DATE_TIME_FORMAT)
    const previousStartDate = moment(previousPeriod.start_datetime).format(
        DATE_TIME_FORMAT,
    )
    const endDate = moment(period.end_datetime).format(DATE_TIME_FORMAT)
    const previousEndDate = moment(previousPeriod.end_datetime).format(
        DATE_TIME_FORMAT,
    )

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
                data.reviewedClosedTicketsTrend.data?.value,
            ),
            formatTrendMetric(
                AutoQAMetric.ReviewedClosedTickets,
                data.reviewedClosedTicketsTrend.data?.prevValue,
            ),
        ],
        [
            TrendCardConfig[AutoQAMetric.ResolutionCompleteness].title,
            formatTrendMetric(
                AutoQAMetric.ResolutionCompleteness,
                data.resolutionCompletenessTrend.data?.value,
            ),
            formatTrendMetric(
                AutoQAMetric.ResolutionCompleteness,
                data.resolutionCompletenessTrend.data?.prevValue,
            ),
        ],
        [
            TrendCardConfig[AutoQAMetric.Accuracy].title,
            formatTrendMetric(
                AutoQAMetric.Accuracy,
                data.accuracyTrend.data?.value,
            ),
            formatTrendMetric(
                AutoQAMetric.Accuracy,
                data.accuracyTrend.data?.prevValue,
            ),
        ],
        [
            TrendCardConfig[AutoQAMetric.InternalCompliance].title,
            formatTrendMetric(
                AutoQAMetric.InternalCompliance,
                data.internalComplianceTrend.data?.value,
            ),
            formatTrendMetric(
                AutoQAMetric.InternalCompliance,
                data.internalComplianceTrend.data?.prevValue,
            ),
        ],
        [
            TrendCardConfig[AutoQAMetric.Efficiency].title,
            formatTrendMetric(
                AutoQAMetric.Efficiency,
                data.efficiencyTrend.data?.value,
            ),
            formatTrendMetric(
                AutoQAMetric.Efficiency,
                data.efficiencyTrend.data?.prevValue,
            ),
        ],
        [
            TrendCardConfig[AutoQAMetric.CommunicationSkills].title,
            formatTrendMetric(
                AutoQAMetric.CommunicationSkills,
                data.communicationSkillsTrend.data?.value,
            ),
            formatTrendMetric(
                AutoQAMetric.CommunicationSkills,
                data.communicationSkillsTrend.data?.prevValue,
            ),
        ],
        [
            TrendCardConfig[AutoQAMetric.LanguageProficiency].title,
            formatTrendMetric(
                AutoQAMetric.LanguageProficiency,
                data.languageProficiencyTrend.data?.value,
            ),
            formatTrendMetric(
                AutoQAMetric.LanguageProficiency,
                data.languageProficiencyTrend.data?.prevValue,
            ),
        ],
        [
            TrendCardConfig[AutoQAMetric.BrandVoice].title,
            formatTrendMetric(
                AutoQAMetric.BrandVoice,
                data.brandVoiceTrend.data?.value,
            ),
            formatTrendMetric(
                AutoQAMetric.BrandVoice,
                data.brandVoiceTrend.data?.prevValue,
            ),
        ],
    ]

    return {
        files: {
            [getCsvFileNameWithDates(
                period,
                AUTO_QA_DOWNLOAD_TRENDS_FILE_NAME,
            )]: createCsv(trendData),
        },
    }
}

export const createReport = (
    agents: User[],
    data: AutoQAReportData,
    columnsOrder: AutoQAAgentsTableColumn[],
    period: Period,
) => {
    const fileName = getCsvFileNameWithDates(
        period,
        AUTO_QA_DOWNLOAD_DATA_FILE_NAME,
    )

    const trendData = createTrendReport(data, period)
    const agentsMetricData = createTableReport(
        agents,
        data,
        columnsOrder,
        period,
    )

    return {
        files: {
            ...trendData.files,
            ...agentsMetricData.files,
        },
        fileName: fileName,
    }
}

export const useAutoQAReportData = () => {
    const agents = useAppSelector<User[]>(getSortedAutoQAAgents)
    const { reportData, isLoading, period } = useAutoQAMetrics()

    return {
        ...createReport(
            agents,
            reportData,
            AUTO_QA_AGENTS_TABLE_DIMENSIONS_COLUMNS_ORDER,
            period,
        ),
        isLoading,
    }
}

const autoQAAgentsMetricsDataSources: TableDataSources<AutoQATableReportData> =
    [
        {
            fetchData: fetchCommunicationSkillsPerAgent,
            title: 'communicationSkillsPerAgent',
        },
        {
            fetchData: fetchResolutionCompletenessPerAgent,
            title: 'resolutionCompletenessPerAgent',
        },
        {
            fetchData: fetchReviewedClosedTicketsPerAgent,
            title: 'reviewedClosedTicketsPerAgent',
        },
        {
            fetchData: fetchLanguageProficiencyPerAgent,
            title: 'languageProficiencyPerAgent',
        },
        { fetchData: fetchAccuracyPerAgent, title: 'accuracyPerAgent' },
        { fetchData: fetchEfficiencyPerAgent, title: 'efficiencyPerAgent' },
        {
            fetchData: fetchInternalCompliancePerAgent,
            title: 'internalCompliancePerAgent',
        },
        { fetchData: fetchBrandVoicePerAgent, title: 'brandVoicePerAgent' },
    ]

export const fetchAutoQAAgentsTableReportData = async (
    statsFilters: StatsFilters,
    userTimezone: string,
    _: ReportingGranularity,
    context: {
        agentsQA: User[]
        customFieldsOrder: TicketInsightsOrder
        selectedCustomFieldId: number | null
    },
) => {
    const metricConfig = autoQAAgentsMetricsDataSources
    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        AUTO_QA_DOWNLOAD_DATA_FILE_NAME,
    )
    return Promise.all([
        fetchTableReportData(statsFilters, userTimezone, metricConfig),
    ])
        .then(([metrics]) => {
            if (metrics.data === null) {
                return {
                    isLoading: false,
                    files: {},
                    fileName,
                }
            }
            return {
                isLoading: false,
                ...createTableReport(
                    context.agentsQA,
                    metrics.data,
                    AUTO_QA_AGENTS_TABLE_DIMENSIONS_COLUMNS_ORDER,
                    statsFilters.period,
                ),
                fileName,
            }
        })
        .catch(() => ({ isLoading: false, files: {}, fileName }))
}
