import moment from 'moment/moment'

import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {User} from 'config/types/user'
import {createCsv, saveZippedFiles} from 'utils/file'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'
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
import {Metric} from 'hooks/reporting/metrics'

export interface Period {
    end_datetime: string
    start_datetime: string
}

export interface VoiceAgentsPerformanceReportData<T = MetricWithDecile> {
    agents: User[]
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
    const metricValue = (
        data.data?.allData as {
            [Property in
                | VoiceCallCube['dimensions']
                | VoiceEventsByAgentCube['dimensions']
                | VoiceCallCube['measures']
                | VoiceEventsByAgentCube['measures']]: string
        }[]
    ).find((item) => Number(item[filteringDimension]) === agentId)?.[
        outputMeasure
    ]

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
            VoiceCallDimension.AgentId,
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
            VoiceCallDimension.AgentId,
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

export const saveReport = async (
    data: VoiceAgentsPerformanceReportData<MetricWithDecile>,
    summaryData: Omit<VoiceAgentsPerformanceReportData<Metric>, 'agents'>,
    period?: Period
) => {
    const {
        agents,
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
            'Answered',
            'Missed',
            'Declined',
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

    const export_datetime = moment().format(DATE_TIME_FORMAT)
    const startDate = moment(period?.start_datetime).format(DATE_TIME_FORMAT)
    const endDate = moment(period?.end_datetime).format(DATE_TIME_FORMAT)
    const periodPrefix = `${startDate}_${endDate}`

    return saveZippedFiles(
        {
            [`${periodPrefix}-call-activity-per-agent-${export_datetime}.csv`]:
                createCsv(voiceAgentsMetricData),
        },
        `${periodPrefix}-call-activity-per-agent-${export_datetime}`
    )
}
