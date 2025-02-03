import {User} from 'config/types/user'
import {
    fetchTableReportData,
    TableDataSources,
    TableSummaryDataSources,
} from 'hooks/reporting/common/useTableReportData'
import {Metric} from 'hooks/reporting/metrics'
import {getCsvFileNameWithDates} from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import {
    VoiceCallCube,
    VoiceCallDimension,
    VoiceCallMeasure,
} from 'models/reporting/cubes/VoiceCallCube'
import {
    VoiceEventsByAgentCube,
    VoiceEventsByAgentDimension,
    VoiceEventsByAgentMeasure,
} from 'models/reporting/cubes/VoiceEventsByAgent'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {ReportFetch} from 'pages/stats/custom-reports/types'
import {VOICE_AGENTS_CALL_ACTIVITY_FILE_NAME} from 'pages/stats/voice/constants/voiceAgents'
import {
    fetchAnsweredCallsMetric,
    fetchAverageTalkTimeMetric,
    fetchDeclinedCallsMetric,
    fetchMissedCallsMetric,
    fetchOutboundCallsMetric,
    fetchTotalCallsMetric,
} from 'pages/stats/voice/hooks/agentMetrics'
import {
    fetchAnsweredCallsMetricPerAgent,
    fetchAverageTalkTimeMetricPerAgent,
    fetchDeclinedCallsMetricPerAgent,
    fetchMissedCallsMetricPerAgent,
    fetchOutboundCallsMetricPerAgent,
    fetchTotalCallsMetricPerAgent,
} from 'pages/stats/voice/hooks/metricsPerDimension'
import {useNewVoiceStatsFilters} from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'
import {useVoiceAgentsMetrics} from 'pages/stats/voice/hooks/useVoiceAgentsMetrics'
import {useVoiceAgentsSummaryMetrics} from 'pages/stats/voice/hooks/useVoiceAgentsSummaryMetrics'
import {getSortedAgents} from 'state/ui/stats/agentPerformanceSlice'
import {createCsv} from 'utils/file'

export interface VoiceAgentsPerformanceReportData<T = MetricWithDecile> {
    totalCallsMetric: T
    answeredCallsMetric: T
    missedCallsMetric: T
    declinedCallsMetric: T
    outboundCallsMetric: T
    averageTalkTimeMetric: T
}

const formatMetric = {
    decimal: (value?: number | null) =>
        formatMetricValue(value, 'decimal', NOT_AVAILABLE_PLACEHOLDER),
}

const getAgentMetric = (
    agentId: number,
    data: MetricWithDecile,
    filteringDimension:
        | VoiceCallCube['dimensions']
        | VoiceEventsByAgentCube['dimensions'],
    outputMeasure:
        | VoiceCallCube['measures']
        | VoiceEventsByAgentCube['measures']
) => {
    const metricValue = (data.data?.allData ?? []).find(
        (item) => Number(item[filteringDimension]) === agentId
    )?.[outputMeasure]

    return typeof metricValue === 'string' ? Number(metricValue) : metricValue
}

const getTotalCallsMetric = (
    agentId: number,
    totalCallsMetric: MetricWithDecile
) =>
    formatMetric.decimal(
        getAgentMetric(
            agentId,
            totalCallsMetric,
            VoiceCallDimension.FilteringAgentId,
            VoiceCallMeasure.VoiceCallCount
        )
    )

const getAnsweredCallsMetric = (
    agentId: number,
    answeredCallsMetric: MetricWithDecile
) =>
    formatMetric.decimal(
        getAgentMetric(
            agentId,
            answeredCallsMetric,
            VoiceCallDimension.FilteringAgentId,
            VoiceCallMeasure.VoiceCallCount
        )
    )

const getMissedCallsMetric = (
    agentId: number,
    missedCallsMetric: MetricWithDecile
) =>
    formatMetric.decimal(
        getAgentMetric(
            agentId,
            missedCallsMetric,
            VoiceCallDimension.FilteringAgentId,
            VoiceCallMeasure.VoiceCallCount
        )
    )

const getDeclinedCallsMetric = (
    agentId: number,
    declinedCallsMetric: MetricWithDecile
) =>
    formatMetric.decimal(
        getAgentMetric(
            agentId,
            declinedCallsMetric,
            VoiceEventsByAgentDimension.AgentId,
            VoiceEventsByAgentMeasure.VoiceEventsCount
        )
    )

const getOutboundCallsMetric = (
    agentId: number,
    outboundCallsMetric: MetricWithDecile
) =>
    formatMetric.decimal(
        getAgentMetric(
            agentId,
            outboundCallsMetric,
            VoiceCallDimension.FilteringAgentId,
            VoiceCallMeasure.VoiceCallCount
        )
    )

const getAverageTalkTimeMetric = (
    agentId: number,
    averageTalkTimeMetric: MetricWithDecile
) =>
    formatMetric.decimal(
        getAgentMetric(
            agentId,
            averageTalkTimeMetric,
            VoiceCallDimension.AgentId,
            VoiceCallMeasure.VoiceCallAverageTalkTime
        )
    )

const getMetricAverage = (metric: Metric, length: number) =>
    metric.data?.value ? metric.data?.value / length : metric.data?.value

export const createReport = (
    agents: User[],
    data: VoiceAgentsPerformanceReportData,
    summaryData: VoiceAgentsPerformanceReportData<Metric>,
    fileName: string
) => {
    const {
        totalCallsMetric,
        answeredCallsMetric,
        missedCallsMetric,
        declinedCallsMetric,
        outboundCallsMetric,
        averageTalkTimeMetric,
    } = data

    const voiceAgentsMetricData = [
        [
            'Agent',
            'Total calls',
            'Inbound answered',
            'Inbound missed',
            'Inbound declined',
            'Outbound',
            'Average talk time',
        ],
        [
            'Team average',
            formatMetric.decimal(
                getMetricAverage(summaryData.totalCallsMetric, agents.length)
            ),
            formatMetric.decimal(
                getMetricAverage(summaryData.answeredCallsMetric, agents.length)
            ),
            formatMetric.decimal(
                getMetricAverage(summaryData.missedCallsMetric, agents.length)
            ),
            formatMetric.decimal(
                getMetricAverage(summaryData.declinedCallsMetric, agents.length)
            ),
            formatMetric.decimal(
                getMetricAverage(summaryData.outboundCallsMetric, agents.length)
            ),
            formatMetric.decimal(summaryData.averageTalkTimeMetric.data?.value),
        ],
        ...agents.map((agent) => {
            return [
                agent.name,
                getTotalCallsMetric(agent.id, totalCallsMetric),
                getAnsweredCallsMetric(agent.id, answeredCallsMetric),
                getMissedCallsMetric(agent.id, missedCallsMetric),
                getDeclinedCallsMetric(agent.id, declinedCallsMetric),
                getOutboundCallsMetric(agent.id, outboundCallsMetric),
                getAverageTalkTimeMetric(agent.id, averageTalkTimeMetric),
            ]
        }),
    ]

    return {
        files: {
            [fileName]: createCsv(voiceAgentsMetricData),
        },
        fileName,
    }
}

export const useVoiceAgentsReportData = () => {
    const agents = useAppSelector<User[]>(getSortedAgents)
    const {cleanStatsFilters, userTimezone} = useNewVoiceStatsFilters()
    const {reportData, isLoading, period} = useVoiceAgentsMetrics(
        cleanStatsFilters,
        userTimezone
    )
    const {summaryData, isLoading: summaryIsLoading} =
        useVoiceAgentsSummaryMetrics(cleanStatsFilters, userTimezone)

    const fileName = getCsvFileNameWithDates(
        period,
        VOICE_AGENTS_CALL_ACTIVITY_FILE_NAME
    )
    return {
        ...createReport(agents, reportData, summaryData, fileName),
        isLoading: isLoading || summaryIsLoading,
    }
}

const agentsMetricsDataSources: TableDataSources<VoiceAgentsPerformanceReportData> =
    [
        {fetchData: fetchTotalCallsMetricPerAgent, title: 'totalCallsMetric'},
        {
            fetchData: fetchAnsweredCallsMetricPerAgent,
            title: 'answeredCallsMetric',
        },
        {fetchData: fetchMissedCallsMetricPerAgent, title: 'missedCallsMetric'},
        {
            fetchData: fetchDeclinedCallsMetricPerAgent,
            title: 'declinedCallsMetric',
        },
        {
            fetchData: fetchOutboundCallsMetricPerAgent,
            title: 'outboundCallsMetric',
        },
        {
            fetchData: fetchAverageTalkTimeMetricPerAgent,
            title: 'averageTalkTimeMetric',
        },
    ]

const agentsSummaryDataSources: TableSummaryDataSources<VoiceAgentsPerformanceReportData> =
    [
        {fetchData: fetchTotalCallsMetric, title: 'totalCallsMetric'},
        {fetchData: fetchAnsweredCallsMetric, title: 'answeredCallsMetric'},
        {fetchData: fetchMissedCallsMetric, title: 'missedCallsMetric'},
        {fetchData: fetchDeclinedCallsMetric, title: 'declinedCallsMetric'},
        {fetchData: fetchOutboundCallsMetric, title: 'outboundCallsMetric'},
        {fetchData: fetchAverageTalkTimeMetric, title: 'averageTalkTimeMetric'},
    ]

export const fetchVoiceAgentsReportData: ReportFetch = async (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    _: ReportingGranularity,
    context: {
        agents: User[]
    }
) => {
    const metricConfig = agentsMetricsDataSources
    const summaryConfig = agentsSummaryDataSources
    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        VOICE_AGENTS_CALL_ACTIVITY_FILE_NAME
    )
    return Promise.all([
        fetchTableReportData(cleanStatsFilters, userTimezone, metricConfig),
        fetchTableReportData(cleanStatsFilters, userTimezone, summaryConfig),
    ])
        .then(([metrics, summary]) => {
            const metricsData = metrics.data
            const summaryData = summary.data
            if (metricsData !== null && summaryData !== null) {
                return {
                    isLoading: false,
                    ...createReport(
                        context.agents,
                        metricsData,
                        summaryData,
                        fileName
                    ),
                    fileName,
                }
            }
            return {isLoading: false, files: {}, fileName}
        })
        .catch(() => ({isLoading: false, files: {}, fileName}))
}
