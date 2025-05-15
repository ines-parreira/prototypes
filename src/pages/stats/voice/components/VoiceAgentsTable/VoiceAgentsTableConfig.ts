import { Metric } from 'hooks/reporting/metrics'
import { MetricWithDecile } from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import {
    VoiceCallDimension,
    VoiceCallMeasure,
} from 'models/reporting/cubes/VoiceCallCube'
import { VoiceEventsByAgentMember } from 'models/reporting/cubes/VoiceEventsByAgent'
import { StatsFilters } from 'models/stat/types'
import { MetricValueFormat } from 'pages/stats/common/utils'
import {
    useAnsweredCallsMetricPerAgent,
    useAverageTalkTimeMetricPerAgent,
    useDeclinedCallsMetricPerAgent,
    useMissedCallsMetricPerAgent,
    useOutboundCallsMetricPerAgent,
    useTotalCallsMetricPerAgent,
} from 'pages/stats/voice/hooks/metricsPerDimension'
import { VoiceAgentsMetric, VoiceAgentsTableColumn } from 'state/ui/stats/types'

export type MetricQueryPerAgentQuery = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) => MetricWithDecile

export type MetricQueryHook = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
) => Metric

export const getQuery = (
    column: VoiceAgentsTableColumn,
): MetricQueryPerAgentQuery => {
    switch (column) {
        case VoiceAgentsTableColumn.AgentName:
            return () => ({
                isFetching: false,
                isError: false,
                data: null,
            })
        case VoiceAgentsTableColumn.TotalCalls:
            return useTotalCallsMetricPerAgent
        case VoiceAgentsTableColumn.InboundAnsweredCalls:
            return useAnsweredCallsMetricPerAgent
        case VoiceAgentsTableColumn.InboundMissedCalls:
            return useMissedCallsMetricPerAgent
        case VoiceAgentsTableColumn.InboundDeclinedCalls:
            return useDeclinedCallsMetricPerAgent
        case VoiceAgentsTableColumn.OutboundCalls:
            return useOutboundCallsMetricPerAgent
        case VoiceAgentsTableColumn.AverageTalkTime:
            return useAverageTalkTimeMetricPerAgent
    }
}

export type VoiceAgentsTableColumnConfig = {
    title: string
    tooltip?: string
    id: VoiceAgentsTableColumn
    metricName?: VoiceAgentsMetric
    metricFormat?: MetricValueFormat
    justifyContent?: 'left' | 'right' | 'center'
}

export const columns: VoiceAgentsTableColumnConfig[] = [
    {
        title: 'Agent',
        justifyContent: 'left',
        id: VoiceAgentsTableColumn.AgentName,
    },
    {
        title: 'Total calls',
        tooltip:
            'Total number of calls that rung an agent, including calls that the agent missed or declined.',
        id: VoiceAgentsTableColumn.TotalCalls,
        metricName: VoiceAgentsMetric.AgentTotalCalls,
    },
    {
        title: 'Inbound Answered',
        id: VoiceAgentsTableColumn.InboundAnsweredCalls,
        metricName: VoiceAgentsMetric.AgentInboundAnsweredCalls,
    },
    {
        title: 'Inbound Missed',
        id: VoiceAgentsTableColumn.InboundMissedCalls,
        metricName: VoiceAgentsMetric.AgentInboundMissedCalls,
    },
    {
        title: 'Inbound Declined',
        id: VoiceAgentsTableColumn.InboundDeclinedCalls,
    },
    {
        title: 'Outbound',
        id: VoiceAgentsTableColumn.OutboundCalls,
        metricName: VoiceAgentsMetric.AgentOutboundCalls,
    },
    {
        title: 'Avg. Talk Time',
        tooltip: 'Average time agent spent talking to customers',
        id: VoiceAgentsTableColumn.AverageTalkTime,
        metricName: VoiceAgentsMetric.AgentAverageTalkTime,
        metricFormat: 'duration',
    },
]

export const agentIdFields = [
    VoiceEventsByAgentMember.AgentId,
    VoiceCallDimension.FilteringAgentId,
    VoiceCallDimension.AgentId,
    VoiceCallMeasure.VoiceCallAverageTalkTime,
]
