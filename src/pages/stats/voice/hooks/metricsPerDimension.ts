import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'
import {
    voiceCallAverageTalkTimePerAgentQueryFactory,
    voiceCallCountPerFilteringAgentQueryFactory,
} from 'models/reporting/queryFactories/voice/voiceCall'
import {declinedVoiceCallsCountPerAgentQueryFactory} from 'models/reporting/queryFactories/voice/voiceEventsByAgent'
import {StatsFilters} from 'models/stat/types'

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
        voiceCallCountPerFilteringAgentQueryFactory(
            statsFilters,
            timezone,
            VoiceCallSegment.answeredCallsByAgent
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
        voiceCallCountPerFilteringAgentQueryFactory(
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

export const useDeclinedCallsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        declinedVoiceCallsCountPerAgentQueryFactory(statsFilters, timezone),
        agentAssigneeId
    )
