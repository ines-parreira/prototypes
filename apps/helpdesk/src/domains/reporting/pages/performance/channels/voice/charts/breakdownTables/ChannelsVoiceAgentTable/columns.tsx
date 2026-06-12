import type { MetricColumnConfig } from '@repo/reporting'

import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import {
    channelsVoiceDeclinedInboundBreakdownQueryFactoryV2,
    channelsVoiceTransferredInboundBreakdownQueryFactoryV2,
} from 'domains/reporting/models/scopes/voiceAgentEvents'
import {
    channelsVoiceAverageTalkTimeBreakdownQueryFactoryV2,
    channelsVoiceInboundAnsweredPerFilteringAgentQueryFactoryV2,
    channelsVoiceInboundUnansweredPerFilteringAgentQueryFactoryV2,
    channelsVoiceOutboundPerFilteringAgentQueryFactoryV2,
    channelsVoiceTotalCallsPerFilteringAgentQueryFactoryV2,
} from 'domains/reporting/models/scopes/voiceCalls'
import type { AgentBreakdownFactory } from 'domains/reporting/pages/performance/utils/useMetricPerAgent'

export type ChannelsVoiceAgentMetricKey =
    | 'totalCalls'
    | 'inboundAnswered'
    | 'inboundMissed'
    | 'inboundTransferred'
    | 'inboundDeclined'
    | 'outbound'
    | 'averageTalkTime'

export const CHANNELS_VOICE_AGENT_METRIC_FACTORIES = {
    totalCalls: channelsVoiceTotalCallsPerFilteringAgentQueryFactoryV2,
    inboundAnswered:
        channelsVoiceInboundAnsweredPerFilteringAgentQueryFactoryV2,
    inboundMissed:
        channelsVoiceInboundUnansweredPerFilteringAgentQueryFactoryV2,
    inboundTransferred: channelsVoiceTransferredInboundBreakdownQueryFactoryV2,
    inboundDeclined: channelsVoiceDeclinedInboundBreakdownQueryFactoryV2,
    outbound: channelsVoiceOutboundPerFilteringAgentQueryFactoryV2,
    averageTalkTime: channelsVoiceAverageTalkTimeBreakdownQueryFactoryV2,
} satisfies Record<ChannelsVoiceAgentMetricKey, AgentBreakdownFactory>

export type ChannelsVoiceAgentEntityMetrics = {
    entity: string
} & Record<ChannelsVoiceAgentMetricKey, number | null>

export type ChannelsVoiceAgentMetricsData = {
    data: ChannelsVoiceAgentEntityMetrics[]
    isLoading: boolean
    isError: boolean
    loadingStates: Record<ChannelsVoiceAgentMetricKey, boolean>
}

export const buildChannelsVoiceAgentEntityRow =
    (
        entityData: Record<
            ChannelsVoiceAgentMetricKey,
            Partial<Record<string, number | null | undefined>>
        >,
    ) =>
    (entity: string): ChannelsVoiceAgentEntityMetrics => ({
        entity,
        totalCalls: entityData.totalCalls[entity] ?? null,
        inboundAnswered: entityData.inboundAnswered[entity] ?? null,
        inboundMissed: entityData.inboundMissed[entity] ?? null,
        inboundTransferred: entityData.inboundTransferred[entity] ?? null,
        inboundDeclined: entityData.inboundDeclined[entity] ?? null,
        outbound: entityData.outbound[entity] ?? null,
        averageTalkTime: entityData.averageTalkTime[entity] ?? null,
    })

export const CHANNELS_VOICE_AGENT_TABLE = {
    title: 'Agent',
    description:
        'Voice metrics per agent: total calls, inbound answered, inbound missed, inbound transferred, inbound declined, outbound, and average talk time.',
}

export const CHANNELS_VOICE_AGENT_COLUMNS: MetricColumnConfig[] = [
    {
        accessorKey: 'totalCalls',
        label: METRIC_TOOLTIPS.voiceTotalCalls.title,
        tooltipConfig: METRIC_TOOLTIPS.voiceTotalCalls,
        metricFormat: 'decimal',
        loadingStateKeys: ['totalCalls'],
    },
    {
        accessorKey: 'inboundAnswered',
        label: METRIC_TOOLTIPS.voiceInboundAnsweredCalls.title,
        tooltipConfig: METRIC_TOOLTIPS.voiceInboundAnsweredCalls,
        metricFormat: 'decimal',
        loadingStateKeys: ['inboundAnswered'],
    },
    {
        accessorKey: 'inboundMissed',
        label: METRIC_TOOLTIPS.voiceInboundMissedCalls.title,
        tooltipConfig: METRIC_TOOLTIPS.voiceInboundMissedCalls,
        metricFormat: 'decimal',
        loadingStateKeys: ['inboundMissed'],
    },
    {
        accessorKey: 'inboundTransferred',
        label: METRIC_TOOLTIPS.voiceInboundTransfers.title,
        tooltipConfig: METRIC_TOOLTIPS.voiceInboundTransfers,
        metricFormat: 'decimal',
        loadingStateKeys: ['inboundTransferred'],
    },
    {
        accessorKey: 'inboundDeclined',
        label: METRIC_TOOLTIPS.voiceInboundDeclined.title,
        tooltipConfig: METRIC_TOOLTIPS.voiceInboundDeclined,
        metricFormat: 'decimal',
        loadingStateKeys: ['inboundDeclined'],
    },
    {
        accessorKey: 'outbound',
        label: METRIC_TOOLTIPS.voiceOutboundCalls.title,
        tooltipConfig: METRIC_TOOLTIPS.voiceOutboundCalls,
        metricFormat: 'decimal',
        loadingStateKeys: ['outbound'],
    },
    {
        accessorKey: 'averageTalkTime',
        label: METRIC_TOOLTIPS.voiceAverageTalkTime.title,
        tooltipConfig: METRIC_TOOLTIPS.voiceAverageTalkTime,
        metricFormat: 'duration',
        loadingStateKeys: ['averageTalkTime'],
    },
]
