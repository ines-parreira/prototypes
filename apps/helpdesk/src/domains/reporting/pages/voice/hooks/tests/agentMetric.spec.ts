import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment/moment'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { fetchMetric, useMetric } from 'domains/reporting/hooks/useMetric'
import {
    VoiceCallMeasure,
    VoiceCallMember,
    VoiceCallSegment,
} from 'domains/reporting/models/cubes/VoiceCallCube'
import {
    VoiceEventsByAgentMeasure,
    VoiceEventsByAgentMember,
    VoiceEventsByAgentSegment,
} from 'domains/reporting/models/cubes/VoiceEventsByAgent'
import {
    voiceCallAverageTalkTimeQueryFactory,
    voiceCallCountQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceCall'
import {
    declinedVoiceCallsCountQueryFactory,
    transferredInboundVoiceCallsCountQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceEventsByAgent'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchAnsweredCallsMetric,
    fetchAverageTalkTimeMetric,
    fetchDeclinedCallsMetric,
    fetchMissedCallsMetric,
    fetchOutboundCallsMetric,
    fetchTotalCallsMetric,
    fetchTransferredInboundCallsMetric,
    ignoreCallsWithNoAgentsFilter,
    ignoreCallsWithNoAssignedAgentFilter,
    ignoreDeclinedWithNoAgentsFilter,
    useAnsweredCallsMetric,
    useAverageTalkTimeMetric,
    useDeclinedCallsMetric,
    useMissedCallsMetric,
    useOutboundCallsMetric,
    useTotalCallsMetric,
    useTransferredInboundCallsMetric,
} from 'domains/reporting/pages/voice/hooks/agentMetrics'
import {
    formatReportingQueryDate,
    withFilter,
} from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetric')
const useMetricMock = assumeMock(useMetric)
const fetchMetricMock = assumeMock(fetchMetric)

describe('metricsPerDimension', () => {
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(moment()),
            start_datetime: formatReportingQueryDate(moment()),
        },
    }
    const userTimezone = 'UTC'

    describe('hooks', () => {
        it('useTotalCallsMetric', () => {
            renderHook(() => useTotalCallsMetric(statsFilters, userTimezone))

            expect(useMetricMock.mock.calls[0]).toEqual([
                {
                    metricName: METRIC_NAMES.VOICE_CALL_COUNT,
                    dimensions: [],
                    filters: [
                        {
                            member: VoiceCallMember.PeriodStart,
                            operator: 'afterDate',
                            values: [statsFilters.period.start_datetime],
                        },
                        {
                            member: VoiceCallMember.PeriodEnd,
                            operator: 'beforeDate',
                            values: [statsFilters.period.end_datetime],
                        },
                        {
                            member: VoiceCallMember.AgentId,
                            operator: 'set',
                            values: [],
                        },
                    ],
                    measures: [VoiceCallMeasure.VoiceCallCount],
                    segments: [VoiceCallSegment.callsInFinalStatus],
                    timezone: userTimezone,
                },
            ])
        })

        it('useAnsweredCallsMetric', () => {
            renderHook(() => useAnsweredCallsMetric(statsFilters, userTimezone))

            expect(useMetricMock.mock.calls[0]).toEqual([
                {
                    metricName: METRIC_NAMES.VOICE_UNANSWERED_CALLS_BY_AGENT,
                    dimensions: [],
                    filters: [
                        {
                            member: VoiceCallMember.PeriodStart,
                            operator: 'afterDate',
                            values: [statsFilters.period.start_datetime],
                        },
                        {
                            member: VoiceCallMember.PeriodEnd,
                            operator: 'beforeDate',
                            values: [statsFilters.period.end_datetime],
                        },
                        {
                            member: VoiceCallMember.AgentId,
                            operator: 'set',
                            values: [],
                        },
                    ],
                    measures: [VoiceCallMeasure.VoiceCallCount],
                    segments: [
                        VoiceCallSegment.inboundAnsweredCallsByAgent,
                        VoiceCallSegment.callsInFinalStatus,
                    ],
                    timezone: userTimezone,
                },
            ])
        })

        it('useMissedCallsMetric', () => {
            renderHook(() => useMissedCallsMetric(statsFilters, userTimezone))

            expect(useMetricMock.mock.calls[0]).toEqual([
                {
                    metricName: METRIC_NAMES.VOICE_MISSED_CALLS_BY_AGENT,
                    dimensions: [],
                    filters: [
                        {
                            member: VoiceCallMember.PeriodStart,
                            operator: 'afterDate',
                            values: [statsFilters.period.start_datetime],
                        },
                        {
                            member: VoiceCallMember.PeriodEnd,
                            operator: 'beforeDate',
                            values: [statsFilters.period.end_datetime],
                        },
                        {
                            member: VoiceCallMember.AgentId,
                            operator: 'set',
                            values: [],
                        },
                    ],
                    measures: [VoiceCallMeasure.VoiceCallCount],
                    segments: [
                        VoiceCallSegment.inboundUnansweredCallsByAgent,
                        VoiceCallSegment.callsInFinalStatus,
                    ],
                    timezone: userTimezone,
                },
            ])
        })

        it('useOutboundCallsMetric', () => {
            renderHook(() => useOutboundCallsMetric(statsFilters, userTimezone))

            expect(useMetricMock.mock.calls[0]).toEqual([
                {
                    metricName: METRIC_NAMES.VOICE_OUTBOUND_CALLS_BY_AGENT,
                    dimensions: [],
                    filters: [
                        {
                            member: VoiceCallMember.PeriodStart,
                            operator: 'afterDate',
                            values: [statsFilters.period.start_datetime],
                        },
                        {
                            member: VoiceCallMember.PeriodEnd,
                            operator: 'beforeDate',
                            values: [statsFilters.period.end_datetime],
                        },
                        {
                            member: VoiceCallMember.AssignedAgentId,
                            operator: 'set',
                            values: [],
                        },
                    ],
                    measures: [VoiceCallMeasure.VoiceCallCount],
                    segments: [
                        VoiceCallSegment.outboundCalls,
                        VoiceCallSegment.callsInFinalStatus,
                    ],
                    timezone: userTimezone,
                },
            ])
        })

        it('useDeclinedCallsMetric', () => {
            renderHook(() => useDeclinedCallsMetric(statsFilters, userTimezone))

            expect(useMetricMock.mock.calls[0]).toEqual([
                {
                    metricName: METRIC_NAMES.VOICE_DECLINED_CALLS_COUNT,
                    dimensions: [],
                    filters: [
                        {
                            member: VoiceEventsByAgentMember.PeriodStart,
                            operator: 'afterDate',
                            values: [statsFilters.period.start_datetime],
                        },
                        {
                            member: VoiceEventsByAgentMember.PeriodEnd,
                            operator: 'beforeDate',
                            values: [statsFilters.period.end_datetime],
                        },
                        {
                            member: VoiceEventsByAgentMember.AgentId,
                            operator: 'set',
                            values: [],
                        },
                    ],
                    measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
                    segments: [
                        VoiceEventsByAgentSegment.declinedCalls,
                        VoiceEventsByAgentSegment.callsInFinalStatus,
                    ],
                    timezone: userTimezone,
                },
            ])
        })

        it('useTransferredInboundCallsMetric', () => {
            renderHook(() =>
                useTransferredInboundCallsMetric(statsFilters, userTimezone),
            )

            expect(useMetricMock.mock.calls[0]).toEqual([
                {
                    metricName:
                        METRIC_NAMES.VOICE_TRANSFERRED_INBOUND_CALLS_COUNT,
                    dimensions: [],
                    filters: [
                        {
                            member: VoiceEventsByAgentMember.PeriodStart,
                            operator: 'afterDate',
                            values: [statsFilters.period.start_datetime],
                        },
                        {
                            member: VoiceEventsByAgentMember.PeriodEnd,
                            operator: 'beforeDate',
                            values: [statsFilters.period.end_datetime],
                        },
                        {
                            member: VoiceEventsByAgentMember.AgentId,
                            operator: 'set',
                            values: [],
                        },
                    ],
                    measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
                    segments: [
                        VoiceEventsByAgentSegment.transferredInboundCalls,
                        VoiceEventsByAgentSegment.callsInFinalStatus,
                    ],
                    timezone: userTimezone,
                },
            ])
        })

        it.each([
            {
                includeLiveData: false,
                expectedSegments: [VoiceCallSegment.callsInFinalStatus],
            },
            { includeLiveData: true, expectedSegments: [] },
        ])(
            'useAverageTalkTimeMetric',
            ({ includeLiveData, expectedSegments }) => {
                renderHook(() =>
                    useAverageTalkTimeMetric(
                        statsFilters,
                        userTimezone,
                        includeLiveData,
                    ),
                )

                expect(useMetricMock.mock.calls[0]).toEqual([
                    {
                        metricName: METRIC_NAMES.VOICE_CALL_AVERAGE_TALK_TIME,
                        dimensions: [],
                        filters: [
                            {
                                member: VoiceCallMember.PeriodStart,
                                operator: 'afterDate',
                                values: [statsFilters.period.start_datetime],
                            },
                            {
                                member: VoiceCallMember.PeriodEnd,
                                operator: 'beforeDate',
                                values: [statsFilters.period.end_datetime],
                            },
                            {
                                member: VoiceCallMember.AssignedAgentId,
                                operator: 'set',
                                values: [],
                            },
                        ],
                        measures: [VoiceCallMeasure.VoiceCallAverageTalkTime],
                        segments: expectedSegments,
                        timezone: userTimezone,
                    },
                ])
            },
        )
    })

    describe('fetch', () => {
        it.each([
            {
                fetch: fetchTotalCallsMetric,
                queryFactory: voiceCallCountQueryFactory,
                segment: undefined,
                filter: ignoreCallsWithNoAgentsFilter,
                metricName: METRIC_NAMES.VOICE_CALL_COUNT,
            },
            {
                fetch: fetchAnsweredCallsMetric,
                queryFactory: voiceCallCountQueryFactory,
                segment: VoiceCallSegment.inboundAnsweredCallsByAgent,
                filter: ignoreCallsWithNoAgentsFilter,
                metricName: METRIC_NAMES.VOICE_UNANSWERED_CALLS_BY_AGENT,
            },
            {
                fetch: fetchMissedCallsMetric,
                queryFactory: voiceCallCountQueryFactory,
                segment: VoiceCallSegment.inboundUnansweredCallsByAgent,
                filter: ignoreCallsWithNoAgentsFilter,
                metricName: METRIC_NAMES.VOICE_MISSED_CALLS_BY_AGENT,
            },
            {
                fetch: fetchOutboundCallsMetric,
                queryFactory: voiceCallCountQueryFactory,
                segment: VoiceCallSegment.outboundCalls,
                filter: ignoreCallsWithNoAssignedAgentFilter,
                metricName: METRIC_NAMES.VOICE_OUTBOUND_CALLS_BY_AGENT,
            },
            {
                fetch: fetchDeclinedCallsMetric,
                queryFactory: declinedVoiceCallsCountQueryFactory,
                segment: undefined,
                filter: ignoreDeclinedWithNoAgentsFilter,
                metricName: METRIC_NAMES.VOICE_DECLINED_CALLS_COUNT,
            },
            {
                fetch: fetchTransferredInboundCallsMetric,
                queryFactory: transferredInboundVoiceCallsCountQueryFactory,
                segment: undefined,
                filter: ignoreDeclinedWithNoAgentsFilter,
            },
        ])(
            'should use $fetch and $segment',
            async ({ fetch, queryFactory, segment, filter, metricName }) => {
                await fetch(statsFilters, userTimezone)

                expect(fetchMetricMock).toHaveBeenCalledWith(
                    withFilter(
                        queryFactory === voiceCallCountQueryFactory
                            ? queryFactory(
                                  statsFilters,
                                  userTimezone,
                                  segment,
                                  undefined,
                                  undefined,
                                  metricName,
                              )
                            : queryFactory(statsFilters, userTimezone, segment),
                        filter,
                    ),
                )
            },
        )

        it('should use fetchAverageTalkTimeMetric', async () => {
            await fetchAverageTalkTimeMetric(statsFilters, userTimezone)

            expect(fetchMetricMock).toHaveBeenCalledWith(
                withFilter(
                    voiceCallAverageTalkTimeQueryFactory(
                        statsFilters,
                        userTimezone,
                    ),
                    ignoreCallsWithNoAssignedAgentFilter,
                ),
            )
        })
    })
})
