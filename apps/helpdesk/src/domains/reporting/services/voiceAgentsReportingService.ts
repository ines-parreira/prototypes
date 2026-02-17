import { createCsv } from '@repo/utils'

import type { User } from 'config/types/user'
import type {
    TableDataSources,
    TableSummaryDataSources,
} from 'domains/reporting/hooks/common/useTableReportData'
import { fetchTableReportData } from 'domains/reporting/hooks/common/useTableReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import type { Metric } from 'domains/reporting/hooks/metrics'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { MetricWithDecile } from 'domains/reporting/hooks/types'
import type { VoiceCallCube } from 'domains/reporting/models/cubes/VoiceCallCube'
import {
    VoiceCallDimension,
    VoiceCallMeasure,
} from 'domains/reporting/models/cubes/VoiceCallCube'
import type { VoiceEventsByAgentCube } from 'domains/reporting/models/cubes/VoiceEventsByAgent'
import {
    VoiceEventsByAgentDimension,
    VoiceEventsByAgentMeasure,
} from 'domains/reporting/models/cubes/VoiceEventsByAgent'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import { VOICE_AGENTS_CALL_ACTIVITY_FILE_NAME } from 'domains/reporting/pages/voice/constants/voiceAgents'
import {
    fetchAnsweredCallsMetric,
    fetchAverageTalkTimeMetric,
    fetchDeclinedCallsMetric,
    fetchMissedCallsMetric,
    fetchOutboundCallsMetric,
    fetchTotalCallsMetric,
    fetchTransferredInboundCallsMetric,
} from 'domains/reporting/pages/voice/hooks/agentMetrics'
import {
    fetchAnsweredCallsMetricPerAgent,
    fetchAverageTalkTimeMetricPerAgent,
    fetchDeclinedCallsMetricPerAgent,
    fetchMissedCallsMetricPerAgent,
    fetchOutboundCallsMetricPerAgent,
    fetchTotalCallsMetricPerAgent,
    fetchTransferredInboundCallsMetricPerAgent,
} from 'domains/reporting/pages/voice/hooks/metricsPerDimension'
import { useVoiceAgentsMetrics } from 'domains/reporting/pages/voice/hooks/useVoiceAgentsMetrics'
import { useVoiceAgentsSummaryMetrics } from 'domains/reporting/pages/voice/hooks/useVoiceAgentsSummaryMetrics'
import { getSortedAgents } from 'domains/reporting/state/ui/stats/voiceAgentsPerformanceSlice'
import useAppSelector from 'hooks/useAppSelector'

export interface VoiceAgentsPerformanceReportData<T = MetricWithDecile> {
    totalCallsMetric: T
    answeredCallsMetric: T
    transferredInboundCallsMetric: T
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
        | VoiceEventsByAgentCube['measures'],
) => {
    const metricValue = (data.data?.allData ?? []).find(
        (item) => Number(item[filteringDimension]) === agentId,
    )?.[outputMeasure]

    return typeof metricValue === 'string' ? Number(metricValue) : metricValue
}

const getTotalCallsMetric = (
    agentId: number,
    totalCallsMetric: MetricWithDecile,
) =>
    formatMetric.decimal(
        getAgentMetric(
            agentId,
            totalCallsMetric,
            VoiceCallDimension.FilteringAgentId,
            VoiceCallMeasure.VoiceCallCount,
        ),
    )

const getAnsweredCallsMetric = (
    agentId: number,
    answeredCallsMetric: MetricWithDecile,
) =>
    formatMetric.decimal(
        getAgentMetric(
            agentId,
            answeredCallsMetric,
            VoiceCallDimension.FilteringAgentId,
            VoiceCallMeasure.VoiceCallCount,
        ),
    )

const getMissedCallsMetric = (
    agentId: number,
    missedCallsMetric: MetricWithDecile,
) =>
    formatMetric.decimal(
        getAgentMetric(
            agentId,
            missedCallsMetric,
            VoiceCallDimension.FilteringAgentId,
            VoiceCallMeasure.VoiceCallCount,
        ),
    )

const getDeclinedCallsMetric = (
    agentId: number,
    declinedCallsMetric: MetricWithDecile,
) =>
    formatMetric.decimal(
        getAgentMetric(
            agentId,
            declinedCallsMetric,
            VoiceEventsByAgentDimension.AgentId,
            VoiceEventsByAgentMeasure.VoiceEventsCount,
        ),
    )

const getOutboundCallsMetric = (
    agentId: number,
    outboundCallsMetric: MetricWithDecile,
) =>
    formatMetric.decimal(
        getAgentMetric(
            agentId,
            outboundCallsMetric,
            VoiceCallDimension.FilteringAgentId,
            VoiceCallMeasure.VoiceCallCount,
        ),
    )

const getAverageTalkTimeMetric = (
    agentId: number,
    averageTalkTimeMetric: MetricWithDecile,
) =>
    formatMetric.decimal(
        getAgentMetric(
            agentId,
            averageTalkTimeMetric,
            VoiceCallDimension.AgentId,
            VoiceCallMeasure.VoiceCallAverageTalkTime,
        ),
    )

const getTransferredInboundCallsMetric = (
    agentId: number,
    transferredInboundCallsMetric: MetricWithDecile,
) =>
    formatMetric.decimal(
        getAgentMetric(
            agentId,
            transferredInboundCallsMetric,
            VoiceEventsByAgentDimension.AgentId,
            VoiceEventsByAgentMeasure.VoiceEventsCount,
        ),
    )

const getMetricAverage = (metric: Metric, length: number) =>
    metric.data?.value ? metric.data?.value / length : metric.data?.value

export const createReport = (
    agents: User[],
    data: VoiceAgentsPerformanceReportData,
    summaryData: VoiceAgentsPerformanceReportData<Metric>,
    fileName: string,
) => {
    const {
        totalCallsMetric,
        answeredCallsMetric,
        transferredInboundCallsMetric,
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
            'Inbound transferred',
            'Inbound missed',
            'Inbound declined',
            'Outbound',
            'Average talk time',
        ],
        [
            'Team average',
            formatMetric.decimal(
                getMetricAverage(summaryData.totalCallsMetric, agents.length),
            ),
            formatMetric.decimal(
                getMetricAverage(
                    summaryData.answeredCallsMetric,
                    agents.length,
                ),
            ),
            formatMetric.decimal(
                getMetricAverage(
                    summaryData.transferredInboundCallsMetric,
                    agents.length,
                ),
            ),
            formatMetric.decimal(
                getMetricAverage(summaryData.missedCallsMetric, agents.length),
            ),
            formatMetric.decimal(
                getMetricAverage(
                    summaryData.declinedCallsMetric,
                    agents.length,
                ),
            ),
            formatMetric.decimal(
                getMetricAverage(
                    summaryData.outboundCallsMetric,
                    agents.length,
                ),
            ),
            formatMetric.decimal(summaryData.averageTalkTimeMetric.data?.value),
        ],
        ...agents.map((agent) => {
            return [
                agent.name,
                getTotalCallsMetric(agent.id, totalCallsMetric),
                getAnsweredCallsMetric(agent.id, answeredCallsMetric),
                getTransferredInboundCallsMetric(
                    agent.id,
                    transferredInboundCallsMetric,
                ),
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
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const { reportData, isLoading, period } = useVoiceAgentsMetrics(
        cleanStatsFilters,
        userTimezone,
    )
    const { summaryData, isLoading: summaryIsLoading } =
        useVoiceAgentsSummaryMetrics(cleanStatsFilters, userTimezone)

    const fileName = getCsvFileNameWithDates(
        period,
        VOICE_AGENTS_CALL_ACTIVITY_FILE_NAME,
    )
    return {
        ...createReport(agents, reportData, summaryData, fileName),
        isLoading: isLoading || summaryIsLoading,
    }
}

const agentsMetricsDataSources: TableDataSources<VoiceAgentsPerformanceReportData> =
    [
        { fetchData: fetchTotalCallsMetricPerAgent, title: 'totalCallsMetric' },
        {
            fetchData: fetchAnsweredCallsMetricPerAgent,
            title: 'answeredCallsMetric',
        },
        {
            fetchData: fetchTransferredInboundCallsMetricPerAgent,
            title: 'transferredInboundCallsMetric',
        },
        {
            fetchData: fetchMissedCallsMetricPerAgent,
            title: 'missedCallsMetric',
        },
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
        { fetchData: fetchTotalCallsMetric, title: 'totalCallsMetric' },
        { fetchData: fetchAnsweredCallsMetric, title: 'answeredCallsMetric' },
        {
            fetchData: fetchTransferredInboundCallsMetric,
            title: 'transferredInboundCallsMetric',
        },
        { fetchData: fetchMissedCallsMetric, title: 'missedCallsMetric' },
        { fetchData: fetchDeclinedCallsMetric, title: 'declinedCallsMetric' },
        { fetchData: fetchOutboundCallsMetric, title: 'outboundCallsMetric' },
        {
            fetchData: fetchAverageTalkTimeMetric,
            title: 'averageTalkTimeMetric',
        },
    ]

export const fetchVoiceAgentsReportData = async (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    _: ReportingGranularity,
    context: {
        agents: User[]
    },
) => {
    const metricConfig = agentsMetricsDataSources
    const summaryConfig = agentsSummaryDataSources
    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        VOICE_AGENTS_CALL_ACTIVITY_FILE_NAME,
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
                        fileName,
                    ),
                    fileName,
                }
            }
            return { isLoading: false, files: {}, fileName }
        })
        .catch(() => ({ isLoading: false, files: {}, fileName }))
}
