import {
    fetchMetricPerDimension,
    fetchMetricPerDimensionV2,
    useMetricPerDimension,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import type { Cubes } from 'domains/reporting/models/cubes'
import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import {
    voiceCallAverageTalkTimePerAgentQueryFactory,
    voiceCallCountPerFilteringAgentQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceCall'
import {
    declinedVoiceCallsCountPerAgentQueryFactory,
    transferredInboundVoiceCallsCountPerAgentQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceEventsByAgent'
import {
    declinedVoiceCallsCountPerAgentQueryV2Factory,
    transferredInboundVoiceCallsCountPerAgentQueryV2Factory,
} from 'domains/reporting/models/scopes/voiceAgentEvents'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import type { OrderDirection } from 'models/api/types'

const createFetchMetricPerDimension =
    <TCube extends Cubes>(
        queryFactory: (
            statsFilters: StatsFilters,
            timezone: string,
        ) => ReportingQuery<TCube>,
    ) =>
    (statsFilters: StatsFilters, timezone: string, dimensionId?: string) =>
        fetchMetricPerDimension(
            queryFactory(statsFilters, timezone),
            dimensionId,
        )

export const useTotalCallsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    useMetricPerDimension(
        voiceCallCountPerFilteringAgentQueryFactory(
            statsFilters,
            timezone,
            undefined,
            sorting,
        ),
        agentAssigneeId,
    )

export const fetchTotalCallsMetricPerAgent = createFetchMetricPerDimension(
    voiceCallCountPerFilteringAgentQueryFactory,
)

export const useAnsweredCallsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    useMetricPerDimension(
        voiceCallCountPerFilteringAgentQueryFactory(
            statsFilters,
            timezone,
            VoiceCallSegment.inboundAnsweredCallsByAgent,
            sorting,
        ),
        agentAssigneeId,
    )

export const fetchAnsweredCallsMetricPerAgent = createFetchMetricPerDimension(
    (statsFilters, timezone) =>
        voiceCallCountPerFilteringAgentQueryFactory(
            statsFilters,
            timezone,
            VoiceCallSegment.inboundAnsweredCallsByAgent,
        ),
)

export const useMissedCallsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    useMetricPerDimension(
        voiceCallCountPerFilteringAgentQueryFactory(
            statsFilters,
            timezone,
            VoiceCallSegment.inboundUnansweredCallsByAgent,
            sorting,
        ),
        agentAssigneeId,
    )

export const fetchMissedCallsMetricPerAgent = createFetchMetricPerDimension(
    (statsFilters, timezone) =>
        voiceCallCountPerFilteringAgentQueryFactory(
            statsFilters,
            timezone,
            VoiceCallSegment.inboundUnansweredCallsByAgent,
        ),
)

export const useOutboundCallsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    useMetricPerDimension(
        voiceCallCountPerFilteringAgentQueryFactory(
            statsFilters,
            timezone,
            VoiceCallSegment.outboundCalls,
            sorting,
        ),
        agentAssigneeId,
    )

export const fetchOutboundCallsMetricPerAgent = createFetchMetricPerDimension(
    (statsFilters, timezone) =>
        voiceCallCountPerFilteringAgentQueryFactory(
            statsFilters,
            timezone,
            VoiceCallSegment.outboundCalls,
        ),
)

export const useAverageTalkTimeMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    useMetricPerDimension(
        voiceCallAverageTalkTimePerAgentQueryFactory(
            statsFilters,
            timezone,
            undefined,
            sorting,
        ),
        agentAssigneeId,
    )

export const fetchAverageTalkTimeMetricPerAgent = createFetchMetricPerDimension(
    voiceCallAverageTalkTimePerAgentQueryFactory,
)

export const useDeclinedCallsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    useMetricPerDimensionV2(
        declinedVoiceCallsCountPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting,
        ),
        declinedVoiceCallsCountPerAgentQueryV2Factory({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        }),
        agentAssigneeId,
    )

export const fetchDeclinedCallsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    dimensionId?: string,
) =>
    fetchMetricPerDimensionV2(
        declinedVoiceCallsCountPerAgentQueryFactory(statsFilters, timezone),
        declinedVoiceCallsCountPerAgentQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
        dimensionId,
    )

export const useTransferredInboundCallsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    useMetricPerDimensionV2(
        transferredInboundVoiceCallsCountPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting,
        ),
        transferredInboundVoiceCallsCountPerAgentQueryV2Factory({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        }),
        agentAssigneeId,
    )

export const fetchTransferredInboundCallsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    dimensionId?: string,
) =>
    fetchMetricPerDimensionV2(
        transferredInboundVoiceCallsCountPerAgentQueryFactory(
            statsFilters,
            timezone,
        ),
        transferredInboundVoiceCallsCountPerAgentQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
        dimensionId,
    )
