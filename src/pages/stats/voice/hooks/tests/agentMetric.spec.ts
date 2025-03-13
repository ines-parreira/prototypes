import { renderHook } from '@testing-library/react-hooks'
import moment from 'moment/moment'

import { fetchMetric, useMetric } from 'hooks/reporting/useMetric'
import {
    VoiceCallMeasure,
    VoiceCallMember,
    VoiceCallSegment,
} from 'models/reporting/cubes/VoiceCallCube'
import {
    VoiceEventsByAgentMeasure,
    VoiceEventsByAgentMember,
    VoiceEventsByAgentSegment,
} from 'models/reporting/cubes/VoiceEventsByAgent'
import {
    voiceCallAverageTalkTimeQueryFactory,
    voiceCallCountQueryFactory,
} from 'models/reporting/queryFactories/voice/voiceCall'
import { declinedVoiceCallsCountQueryFactory } from 'models/reporting/queryFactories/voice/voiceEventsByAgent'
import { StatsFilters } from 'models/stat/types'
import { formatReportingQueryDate, withFilter } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

import {
    fetchAnsweredCallsMetric,
    fetchAverageTalkTimeMetric,
    fetchDeclinedCallsMetric,
    fetchMissedCallsMetric,
    fetchOutboundCallsMetric,
    fetchTotalCallsMetric,
    ignoreCallsWithNoAgentsFilter,
    ignoreCallsWithNoAssignedAgentFilter,
    ignoreDeclinedWithNoAgentsFilter,
    useAnsweredCallsMetric,
    useAverageTalkTimeMetric,
    useDeclinedCallsMetric,
    useMissedCallsMetric,
    useOutboundCallsMetric,
    useTotalCallsMetric,
} from '../agentMetrics'

jest.mock('hooks/reporting/useMetric')
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
                        VoiceCallSegment.answeredCallsByAgent,
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
                        VoiceCallSegment.missedCallsByAgent,
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
            },
            {
                fetch: fetchAnsweredCallsMetric,
                queryFactory: voiceCallCountQueryFactory,
                segment: VoiceCallSegment.answeredCallsByAgent,
                filter: ignoreCallsWithNoAgentsFilter,
            },
            {
                fetch: fetchMissedCallsMetric,
                queryFactory: voiceCallCountQueryFactory,
                segment: VoiceCallSegment.missedCallsByAgent,
                filter: ignoreCallsWithNoAgentsFilter,
            },
            {
                fetch: fetchOutboundCallsMetric,
                queryFactory: voiceCallCountQueryFactory,
                segment: VoiceCallSegment.outboundCalls,
                filter: ignoreCallsWithNoAssignedAgentFilter,
            },
            {
                fetch: fetchDeclinedCallsMetric,
                queryFactory: declinedVoiceCallsCountQueryFactory,
                segment: undefined,
                filter: ignoreDeclinedWithNoAgentsFilter,
            },
        ])(
            'should use $fetch and $segment',
            async ({ fetch, queryFactory, segment, filter }) => {
                await fetch(statsFilters, userTimezone)

                expect(fetchMetricMock).toHaveBeenCalledWith(
                    withFilter(
                        queryFactory(statsFilters, userTimezone, segment),
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
