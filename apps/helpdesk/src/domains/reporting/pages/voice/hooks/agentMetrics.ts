import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { Metric } from 'domains/reporting/hooks/metrics'
import { fetchMetric, useMetric } from 'domains/reporting/hooks/useMetric'
import {
    VoiceCallMember,
    VoiceCallSegment,
} from 'domains/reporting/models/cubes/VoiceCallCube'
import { VoiceEventsByAgentMember } from 'domains/reporting/models/cubes/VoiceEventsByAgent'
import {
    voiceCallAverageTalkTimeQueryFactory,
    voiceCallCountQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceCall'
import {
    declinedVoiceCallsCountQueryFactory,
    transferredInboundVoiceCallsCountQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceEventsByAgent'
import {
    declinedVoiceCallsCountQueryV2Factory,
    transferredInboundVoiceCallsCountQueryV2Factory,
} from 'domains/reporting/models/scopes/voiceAgentEvents'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingFilter } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { withFilter } from 'domains/reporting/utils/reporting'

export const ignoreCallsWithNoAgentsFilter: ReportingFilter = {
    member: VoiceCallMember.AgentId,
    operator: ReportingFilterOperator.Set,
    values: [],
}

export const ignoreCallsWithNoAssignedAgentFilter: ReportingFilter = {
    member: VoiceCallMember.AssignedAgentId,
    operator: ReportingFilterOperator.Set,
    values: [],
}

export const ignoreDeclinedWithNoAgentsFilter: ReportingFilter = {
    member: VoiceEventsByAgentMember.AgentId,
    operator: ReportingFilterOperator.Set,
    values: [],
}

// P2/P3
export const useTotalCallsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        withFilter(
            voiceCallCountQueryFactory(statsFilters, timezone),
            ignoreCallsWithNoAgentsFilter,
        ),
    )

export const fetchTotalCallsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            voiceCallCountQueryFactory(statsFilters, timezone),
            ignoreCallsWithNoAgentsFilter,
        ),
    )

// P2/P3
export const useAnsweredCallsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        withFilter(
            voiceCallCountQueryFactory(
                statsFilters,
                timezone,
                VoiceCallSegment.inboundAnsweredCallsByAgent,
                undefined,
                undefined,
                METRIC_NAMES.VOICE_UNANSWERED_CALLS_BY_AGENT,
            ),
            ignoreCallsWithNoAgentsFilter,
        ),
    )

// P2/P3
export const fetchAnsweredCallsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            voiceCallCountQueryFactory(
                statsFilters,
                timezone,
                VoiceCallSegment.inboundAnsweredCallsByAgent,
                undefined,
                undefined,
                METRIC_NAMES.VOICE_UNANSWERED_CALLS_BY_AGENT,
            ),
            ignoreCallsWithNoAgentsFilter,
        ),
    )
// P2/P3
export const useMissedCallsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        withFilter(
            voiceCallCountQueryFactory(
                statsFilters,
                timezone,
                VoiceCallSegment.inboundUnansweredCallsByAgent,
                undefined,
                undefined,
                METRIC_NAMES.VOICE_MISSED_CALLS_BY_AGENT,
            ),
            ignoreCallsWithNoAgentsFilter,
        ),
    )

// P2/P3
export const fetchMissedCallsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            voiceCallCountQueryFactory(
                statsFilters,
                timezone,
                VoiceCallSegment.inboundUnansweredCallsByAgent,
                undefined,
                undefined,
                METRIC_NAMES.VOICE_MISSED_CALLS_BY_AGENT,
            ),
            ignoreCallsWithNoAgentsFilter,
        ),
    )
// P2/P3
export const useOutboundCallsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        withFilter(
            voiceCallCountQueryFactory(
                statsFilters,
                timezone,
                VoiceCallSegment.outboundCalls,
                undefined,
                undefined,
                METRIC_NAMES.VOICE_OUTBOUND_CALLS_BY_AGENT,
            ),
            ignoreCallsWithNoAssignedAgentFilter,
        ),
    )

// P2/P3
export const fetchOutboundCallsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            voiceCallCountQueryFactory(
                statsFilters,
                timezone,
                VoiceCallSegment.outboundCalls,
                undefined,
                undefined,
                METRIC_NAMES.VOICE_OUTBOUND_CALLS_BY_AGENT,
            ),
            ignoreCallsWithNoAssignedAgentFilter,
        ),
    )
// P2/P3
export const useDeclinedCallsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        withFilter(
            declinedVoiceCallsCountQueryFactory(statsFilters, timezone),
            ignoreDeclinedWithNoAgentsFilter,
        ),
        declinedVoiceCallsCountQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )

export const fetchDeclinedCallsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            declinedVoiceCallsCountQueryFactory(statsFilters, timezone),
            ignoreDeclinedWithNoAgentsFilter,
        ),
        declinedVoiceCallsCountQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )
// P2/P3
export const useAverageTalkTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string,
    includeLiveData: boolean = false,
): Metric =>
    useMetric(
        withFilter(
            voiceCallAverageTalkTimeQueryFactory(
                statsFilters,
                timezone,
                includeLiveData,
            ),
            ignoreCallsWithNoAssignedAgentFilter,
        ),
    )

export const fetchAverageTalkTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            voiceCallAverageTalkTimeQueryFactory(statsFilters, timezone),
            ignoreCallsWithNoAssignedAgentFilter,
        ),
    )
// P2/P3
export const useTransferredInboundCallsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        withFilter(
            transferredInboundVoiceCallsCountQueryFactory(
                statsFilters,
                timezone,
            ),
            ignoreDeclinedWithNoAgentsFilter,
        ),
        transferredInboundVoiceCallsCountQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )

export const fetchTransferredInboundCallsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            transferredInboundVoiceCallsCountQueryFactory(
                statsFilters,
                timezone,
            ),
            ignoreDeclinedWithNoAgentsFilter,
        ),
        transferredInboundVoiceCallsCountQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )
