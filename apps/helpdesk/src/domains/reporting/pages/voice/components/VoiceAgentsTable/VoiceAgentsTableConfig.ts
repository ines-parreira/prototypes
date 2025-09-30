import { MetricValueFormat } from '@repo/reporting'

import { Metric } from 'domains/reporting/hooks/metrics'
import { MetricWithDecile } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    VoiceCallDimension,
    VoiceCallMeasure,
} from 'domains/reporting/models/cubes/VoiceCallCube'
import { VoiceEventsByAgentMember } from 'domains/reporting/models/cubes/VoiceEventsByAgent'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    useAnsweredCallsMetricPerAgent,
    useAverageTalkTimeMetricPerAgent,
    useDeclinedCallsMetricPerAgent,
    useMissedCallsMetricPerAgent,
    useOutboundCallsMetricPerAgent,
    useTotalCallsMetricPerAgent,
    useTransferredInboundCallsMetricPerAgent,
} from 'domains/reporting/pages/voice/hooks/metricsPerDimension'
import {
    VoiceAgentsMetric,
    VoiceAgentsTableColumn,
} from 'domains/reporting/state/ui/stats/types'
import { OrderDirection } from 'models/api/types'

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
        case VoiceAgentsTableColumn.InboundTransferredCalls:
            return useTransferredInboundCallsMetricPerAgent
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

export const oldColumns: VoiceAgentsTableColumnConfig[] = [
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
        title: 'Inbound Transferred',
        tooltip:
            'Total number of transferred calls to an agent, queue or external number.',
        id: VoiceAgentsTableColumn.InboundTransferredCalls,
        metricName: VoiceAgentsMetric.AgentInboundTransferredCalls,
    },
    {
        title: 'Inbound Missed',
        id: VoiceAgentsTableColumn.InboundMissedCalls,
        metricName: VoiceAgentsMetric.AgentInboundMissedCalls,
    },
    {
        title: 'Inbound Declined',
        id: VoiceAgentsTableColumn.InboundDeclinedCalls,
        metricName: VoiceAgentsMetric.AgentInboundDeclinedCalls,
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
