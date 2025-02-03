import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import {Cubes} from 'models/reporting/cubes'
import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'
import {
    voiceCallAverageTalkTimePerAgentQueryFactory,
    voiceCallCountPerFilteringAgentQueryFactory,
} from 'models/reporting/queryFactories/voice/voiceCall'
import {declinedVoiceCallsCountPerAgentQueryFactory} from 'models/reporting/queryFactories/voice/voiceEventsByAgent'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

const createFetchMetricPerDimension =
    <TCube extends Cubes>(
        queryFactory: (
            statsFilters: StatsFilters,
            timezone: string
        ) => ReportingQuery<TCube>
    ) =>
    (statsFilters: StatsFilters, timezone: string, dimensionId?: string) =>
        fetchMetricPerDimension(
            queryFactory(statsFilters, timezone),
            dimensionId
        )

export const useTotalCallsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        voiceCallCountPerFilteringAgentQueryFactory(statsFilters, timezone),
        agentAssigneeId
    )

export const fetchTotalCallsMetricPerAgent = createFetchMetricPerDimension(
    voiceCallCountPerFilteringAgentQueryFactory
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

export const fetchAnsweredCallsMetricPerAgent = createFetchMetricPerDimension(
    (statsFilters, timezone) =>
        voiceCallCountPerFilteringAgentQueryFactory(
            statsFilters,
            timezone,
            VoiceCallSegment.answeredCallsByAgent
        )
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

export const fetchMissedCallsMetricPerAgent = createFetchMetricPerDimension(
    (statsFilters, timezone) =>
        voiceCallCountPerFilteringAgentQueryFactory(
            statsFilters,
            timezone,
            VoiceCallSegment.missedCallsByAgent
        )
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

export const fetchOutboundCallsMetricPerAgent = createFetchMetricPerDimension(
    (statsFilters, timezone) =>
        voiceCallCountPerFilteringAgentQueryFactory(
            statsFilters,
            timezone,
            VoiceCallSegment.outboundCalls
        )
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

export const fetchAverageTalkTimeMetricPerAgent = createFetchMetricPerDimension(
    voiceCallAverageTalkTimePerAgentQueryFactory
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

export const fetchDeclinedCallsMetricPerAgent = createFetchMetricPerDimension(
    declinedVoiceCallsCountPerAgentQueryFactory
)
