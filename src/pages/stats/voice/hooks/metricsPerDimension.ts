import {StatsFilters} from 'models/stat/types'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {
    voiceCallAverageTalkTimePerAgentQueryFactory,
    voiceCallCountPerAgentQueryFactory,
    voiceCallCountPerFilteringAgentQueryFactory,
} from 'models/reporting/queryFactories/voice/voiceCall'
import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'

export const useTotalCallsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        voiceCallCountPerFilteringAgentQueryFactory(statsFilters, timezone),
        agentAssigneeId
    )

export const useAnsweredCallsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        voiceCallCountPerAgentQueryFactory(
            statsFilters,
            timezone,
            VoiceCallSegment.inboundCalls
        ),
        agentAssigneeId
    )

export const useMissedCallsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        voiceCallCountPerFilteringAgentQueryFactory(
            statsFilters,
            timezone,
            VoiceCallSegment.missedCallsByAgent
        ),
        agentAssigneeId
    )

export const useOutboundCallsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        voiceCallCountPerAgentQueryFactory(
            statsFilters,
            timezone,
            VoiceCallSegment.outboundCalls
        ),
        agentAssigneeId
    )

export const useAverageTalkTimeMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        voiceCallAverageTalkTimePerAgentQueryFactory(statsFilters, timezone),
        agentAssigneeId
    )
