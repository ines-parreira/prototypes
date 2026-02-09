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
import {
    declinedVoiceCallsCountQueryV2Factory,
    transferredInboundVoiceCallsCountQueryV2Factory,
} from 'domains/reporting/models/scopes/voiceAgentEvents'
import {
    voiceCallsAverageTalkTimeQueryFactoryV2,
    voiceCallsCountQueryFactoryV2,
} from 'domains/reporting/models/scopes/voiceCalls'
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
    ignoreCallsWithNoFilteringAgentFilter,
    ignoreDeclinedWithNoAgentsFilter,
    useAnsweredCallsMetric,
    useAverageTalkTimeMetric,
    useDeclinedCallsMetric,
    useMissedCallsMetric,
    useOutboundCallsMetric,
    useTotalCallsMetric,
    useTransferredInboundCallsMetric,
    withIgnoreNoAgentFilter,
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
                    metricName: METRIC_NAMES.VOICE_CALL_COUNT_TREND,
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
                voiceCallsCountQueryFactoryV2(
                    {
                        filters: { ...statsFilters },
                        timezone: userTimezone,
                    },
                    undefined,
                    true,
                ),
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
                voiceCallsCountQueryFactoryV2(
                    {
                        filters: { ...statsFilters },
                        timezone: userTimezone,
                    },
                    VoiceCallSegment.inboundAnsweredCallsByAgent,
                    true,
                ),
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
                voiceCallsCountQueryFactoryV2(
                    {
                        filters: { ...statsFilters },
                        timezone: userTimezone,
                    },
                    VoiceCallSegment.inboundUnansweredCallsByAgent,
                    true,
                ),
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
                            member: VoiceCallMember.AgentId,
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
                voiceCallsCountQueryFactoryV2(
                    {
                        filters: { ...statsFilters },
                        timezone: userTimezone,
                    },
                    VoiceCallSegment.outboundCalls,
                    true,
                ),
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
                declinedVoiceCallsCountQueryV2Factory({
                    filters: statsFilters,
                    timezone: userTimezone,
                }),
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
                transferredInboundVoiceCallsCountQueryV2Factory({
                    filters: statsFilters,
                    timezone: userTimezone,
                }),
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
                                member: VoiceCallMember.AgentId,
                                operator: 'set',
                                values: [],
                            },
                        ],
                        measures: [VoiceCallMeasure.VoiceCallAverageTalkTime],
                        segments: expectedSegments,
                        timezone: userTimezone,
                    },
                    voiceCallsAverageTalkTimeQueryFactoryV2(
                        {
                            filters: { ...statsFilters },
                            timezone: userTimezone,
                        },
                        true,
                    ),
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
                metricName: undefined,
                v2QueryFactory: voiceCallsCountQueryFactoryV2,
                v2Segment: undefined,
            },
            {
                fetch: fetchAnsweredCallsMetric,
                queryFactory: voiceCallCountQueryFactory,
                segment: VoiceCallSegment.inboundAnsweredCallsByAgent,
                filter: ignoreCallsWithNoAgentsFilter,
                metricName: METRIC_NAMES.VOICE_UNANSWERED_CALLS_BY_AGENT,
                v2QueryFactory: voiceCallsCountQueryFactoryV2,
                v2Segment: VoiceCallSegment.inboundAnsweredCallsByAgent,
            },
            {
                fetch: fetchMissedCallsMetric,
                queryFactory: voiceCallCountQueryFactory,
                segment: VoiceCallSegment.inboundUnansweredCallsByAgent,
                filter: ignoreCallsWithNoAgentsFilter,
                metricName: METRIC_NAMES.VOICE_MISSED_CALLS_BY_AGENT,
                v2QueryFactory: voiceCallsCountQueryFactoryV2,
                v2Segment: VoiceCallSegment.inboundUnansweredCallsByAgent,
            },
            {
                fetch: fetchOutboundCallsMetric,
                queryFactory: voiceCallCountQueryFactory,
                segment: VoiceCallSegment.outboundCalls,
                filter: ignoreCallsWithNoFilteringAgentFilter,
                metricName: METRIC_NAMES.VOICE_OUTBOUND_CALLS_BY_AGENT,
                v2QueryFactory: voiceCallsCountQueryFactoryV2,
                v2Segment: VoiceCallSegment.outboundCalls,
            },
            {
                fetch: fetchDeclinedCallsMetric,
                queryFactory: declinedVoiceCallsCountQueryFactory,
                segment: undefined,
                filter: ignoreDeclinedWithNoAgentsFilter,
                metricName: METRIC_NAMES.VOICE_DECLINED_CALLS_COUNT,
                v2QueryFactory: declinedVoiceCallsCountQueryV2Factory,
                v2Segment: undefined,
            },
            {
                fetch: fetchTransferredInboundCallsMetric,
                queryFactory: transferredInboundVoiceCallsCountQueryFactory,
                segment: undefined,
                filter: ignoreDeclinedWithNoAgentsFilter,
                v2QueryFactory: transferredInboundVoiceCallsCountQueryV2Factory,
                v2Segment: undefined,
            },
        ])(
            'should use $fetch and $segment',
            async ({
                fetch,
                queryFactory,
                segment,
                filter,
                metricName,
                v2QueryFactory,
                v2Segment,
            }) => {
                await fetch(statsFilters, userTimezone)

                const v1Query = withFilter(
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
                )

                if (v2QueryFactory) {
                    expect(fetchMetricMock).toHaveBeenCalledWith(
                        v1Query,
                        v2QueryFactory(
                            {
                                filters: { ...statsFilters },
                                timezone: userTimezone,
                            },
                            v2Segment,
                            true,
                        ),
                    )
                } else {
                    expect(fetchMetricMock).toHaveBeenCalledWith(v1Query)
                }
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
                    ignoreCallsWithNoFilteringAgentFilter,
                ),
                voiceCallsAverageTalkTimeQueryFactoryV2(
                    {
                        filters: { ...statsFilters },
                        timezone: userTimezone,
                    },
                    true,
                ),
            )
        })
    })

    describe('withIgnoreNoAgentFilter', () => {
        const baseQuery = {
            measures: [VoiceCallMeasure.VoiceCallCount],
            dimensions: [],
            filters: [
                {
                    member: VoiceCallMember.PeriodStart,
                    operator: 'afterDate',
                    values: ['2024-01-01T00:00:00.000'],
                },
                {
                    member: VoiceCallMember.PeriodEnd,
                    operator: 'beforeDate',
                    values: ['2024-01-31T23:59:59.999'],
                },
            ],
            segments: [],
            timezone: 'UTC',
        } as any

        it('should add filter when member does not exist in query', () => {
            const result = withIgnoreNoAgentFilter(
                baseQuery,
                ignoreCallsWithNoAgentsFilter,
            )

            expect(result.filters).toHaveLength(3)
            expect(result.filters).toContainEqual(ignoreCallsWithNoAgentsFilter)
        })

        it('should not add filter when member already exists in query', () => {
            const queryWithAgentFilter = {
                ...baseQuery,
                filters: [
                    ...baseQuery.filters,
                    {
                        member: VoiceCallMember.AgentId,
                        operator: 'equals',
                        values: ['123'],
                    },
                ],
            }

            const result = withIgnoreNoAgentFilter(
                queryWithAgentFilter,
                ignoreCallsWithNoAgentsFilter,
            )

            expect(result.filters).toHaveLength(3)
            expect(result.filters).toEqual(queryWithAgentFilter.filters)
        })

        it('should preserve existing filters when adding new filter', () => {
            const result = withIgnoreNoAgentFilter(
                baseQuery,
                ignoreCallsWithNoAgentsFilter,
            )

            expect(result.filters).toContainEqual({
                member: VoiceCallMember.PeriodStart,
                operator: 'afterDate',
                values: ['2024-01-01T00:00:00.000'],
            })
            expect(result.filters).toContainEqual({
                member: VoiceCallMember.PeriodEnd,
                operator: 'beforeDate',
                values: ['2024-01-31T23:59:59.999'],
            })
            expect(result.filters).toContainEqual(ignoreCallsWithNoAgentsFilter)
        })

        it('should return unchanged query when filter member already exists', () => {
            const queryWithAgentFilter = {
                ...baseQuery,
                filters: [...baseQuery.filters, ignoreCallsWithNoAgentsFilter],
            }

            const result = withIgnoreNoAgentFilter(
                queryWithAgentFilter,
                ignoreCallsWithNoAgentsFilter,
            )

            expect(result).toEqual(queryWithAgentFilter)
        })

        it('should work with different filter members', () => {
            const result = withIgnoreNoAgentFilter(
                baseQuery,
                ignoreDeclinedWithNoAgentsFilter,
            )

            expect(result.filters).toHaveLength(3)
            expect(result.filters).toContainEqual(
                ignoreDeclinedWithNoAgentsFilter,
            )
        })
    })
})
