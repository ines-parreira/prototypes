import { Metric } from 'hooks/reporting/metrics'
import { fetchMetric, useMetric } from 'hooks/reporting/useMetric'
import {
    VoiceCallMember,
    VoiceCallSegment,
} from 'models/reporting/cubes/VoiceCallCube'
import { VoiceEventsByAgentMember } from 'models/reporting/cubes/VoiceEventsByAgent'
import {
    voiceCallAverageTalkTimeQueryFactory,
    voiceCallCountQueryFactory,
} from 'models/reporting/queryFactories/voice/voiceCall'
import { declinedVoiceCallsCountQueryFactory } from 'models/reporting/queryFactories/voice/voiceEventsByAgent'
import {
    ReportingFilter,
    ReportingFilterOperator,
} from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { withFilter } from 'utils/reporting'

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

export const useAnsweredCallsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        withFilter(
            voiceCallCountQueryFactory(
                statsFilters,
                timezone,
                VoiceCallSegment.answeredCallsByAgent,
            ),
            ignoreCallsWithNoAgentsFilter,
        ),
    )

export const fetchAnsweredCallsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            voiceCallCountQueryFactory(
                statsFilters,
                timezone,
                VoiceCallSegment.answeredCallsByAgent,
            ),
            ignoreCallsWithNoAgentsFilter,
        ),
    )

export const useMissedCallsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        withFilter(
            voiceCallCountQueryFactory(
                statsFilters,
                timezone,
                VoiceCallSegment.missedCallsByAgent,
            ),
            ignoreCallsWithNoAgentsFilter,
        ),
    )

export const fetchMissedCallsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            voiceCallCountQueryFactory(
                statsFilters,
                timezone,
                VoiceCallSegment.missedCallsByAgent,
            ),
            ignoreCallsWithNoAgentsFilter,
        ),
    )

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
            ),
            ignoreCallsWithNoAssignedAgentFilter,
        ),
    )

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
            ),
            ignoreCallsWithNoAssignedAgentFilter,
        ),
    )

export const useDeclinedCallsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        withFilter(
            declinedVoiceCallsCountQueryFactory(statsFilters, timezone),
            ignoreDeclinedWithNoAgentsFilter,
        ),
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
    )

export const useAverageTalkTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        withFilter(
            voiceCallAverageTalkTimeQueryFactory(statsFilters, timezone),
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
