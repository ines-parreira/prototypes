import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment/moment'

import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
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
import {
    voiceCallsAverageTalkTimePerAgentQueryFactoryV2,
    voiceCallsCountPerFilteringAgentQueryFactoryV2,
} from 'domains/reporting/models/scopes/voiceCalls'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchAnsweredCallsMetricPerAgent,
    fetchAverageTalkTimeMetricPerAgent,
    fetchDeclinedCallsMetricPerAgent,
    fetchMissedCallsMetricPerAgent,
    fetchOutboundCallsMetricPerAgent,
    fetchTotalCallsMetricPerAgent,
    fetchTransferredInboundCallsMetricPerAgent,
    useAnsweredCallsMetricPerAgent,
    useAverageTalkTimeMetricPerAgent,
    useDeclinedCallsMetricPerAgent,
    useMissedCallsMetricPerAgent,
    useOutboundCallsMetricPerAgent,
    useTotalCallsMetricPerAgent,
    useTransferredInboundCallsMetricPerAgent,
} from 'domains/reporting/pages/voice/hooks/metricsPerDimension'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionV2Mock = assumeMock(useMetricPerDimensionV2)
const fetchMetricPerDimensionV2Mock = assumeMock(fetchMetricPerDimensionV2)

describe('metricsPerDimension', () => {
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(moment()),
            start_datetime: formatReportingQueryDate(moment()),
        },
    }
    const userTimezone = 'UTC'
    const agentId = '1'
    const sorting = OrderDirection.Asc

    describe('hooks', () => {
        it('useTotalCallsMetricPerAgent', () => {
            renderHook(() =>
                useTotalCallsMetricPerAgent(
                    statsFilters,
                    userTimezone,
                    sorting,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                voiceCallCountPerFilteringAgentQueryFactory(
                    statsFilters,
                    userTimezone,
                    undefined,
                    sorting,
                ),
                voiceCallsCountPerFilteringAgentQueryFactoryV2(
                    {
                        filters: statsFilters,
                        timezone: userTimezone,
                        sortDirection: sorting,
                    },
                    undefined,
                ),
                agentId,
            )
        })

        it('useAnsweredCallsMetricPerAgent', () => {
            renderHook(() =>
                useAnsweredCallsMetricPerAgent(
                    statsFilters,
                    userTimezone,
                    sorting,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                voiceCallCountPerFilteringAgentQueryFactory(
                    statsFilters,
                    userTimezone,
                    VoiceCallSegment.inboundAnsweredCallsByAgent,
                    sorting,
                ),
                voiceCallsCountPerFilteringAgentQueryFactoryV2(
                    {
                        filters: statsFilters,
                        timezone: userTimezone,
                        sortDirection: sorting,
                    },
                    VoiceCallSegment.inboundAnsweredCallsByAgent,
                ),
                agentId,
            )
        })

        it('useMissedCallsMetricPerAgent', () => {
            renderHook(() =>
                useMissedCallsMetricPerAgent(
                    statsFilters,
                    userTimezone,
                    sorting,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                voiceCallCountPerFilteringAgentQueryFactory(
                    statsFilters,
                    userTimezone,
                    VoiceCallSegment.inboundUnansweredCallsByAgent,
                    sorting,
                ),
                voiceCallsCountPerFilteringAgentQueryFactoryV2(
                    {
                        filters: statsFilters,
                        timezone: userTimezone,
                        sortDirection: sorting,
                    },
                    VoiceCallSegment.inboundUnansweredCallsByAgent,
                ),
                agentId,
            )
        })

        it('useOutboundCallsMetricPerAgent', () => {
            renderHook(() =>
                useOutboundCallsMetricPerAgent(
                    statsFilters,
                    userTimezone,
                    sorting,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                voiceCallCountPerFilteringAgentQueryFactory(
                    statsFilters,
                    userTimezone,
                    VoiceCallSegment.outboundCalls,
                    sorting,
                ),
                voiceCallsCountPerFilteringAgentQueryFactoryV2(
                    {
                        filters: statsFilters,
                        timezone: userTimezone,
                        sortDirection: sorting,
                    },
                    VoiceCallSegment.outboundCalls,
                ),
                agentId,
            )
        })

        it('useAverageTalkTimeMetricPerAgent', () => {
            renderHook(() =>
                useAverageTalkTimeMetricPerAgent(
                    statsFilters,
                    userTimezone,
                    sorting,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                voiceCallAverageTalkTimePerAgentQueryFactory(
                    statsFilters,
                    userTimezone,
                    undefined,
                    sorting,
                ),
                voiceCallsAverageTalkTimePerAgentQueryFactoryV2({
                    filters: statsFilters,
                    timezone: userTimezone,
                    sortDirection: sorting,
                }),
                agentId,
            )
        })

        it('useDeclinedCallsMetricPerAgent', () => {
            renderHook(() =>
                useDeclinedCallsMetricPerAgent(
                    statsFilters,
                    userTimezone,
                    sorting,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionV2Mock.mock.calls[0]).toEqual([
                declinedVoiceCallsCountPerAgentQueryFactory(
                    statsFilters,
                    userTimezone,
                    sorting,
                ),
                declinedVoiceCallsCountPerAgentQueryV2Factory({
                    filters: statsFilters,
                    timezone: userTimezone,
                    sortDirection: sorting,
                }),
                agentId,
            ])
        })

        it('useTransferredInboundCallsMetricPerAgent', () => {
            renderHook(() =>
                useTransferredInboundCallsMetricPerAgent(
                    statsFilters,
                    userTimezone,
                    sorting,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionV2Mock.mock.calls[0]).toEqual([
                transferredInboundVoiceCallsCountPerAgentQueryFactory(
                    statsFilters,
                    userTimezone,
                    sorting,
                ),
                transferredInboundVoiceCallsCountPerAgentQueryV2Factory({
                    filters: statsFilters,
                    timezone: userTimezone,
                    sortDirection: sorting,
                }),
                agentId,
            ])
        })
    })

    describe('fetch', () => {
        it.each([
            {
                name: 'fetchTotalCallsMetricPerAgent',
                fetch: fetchTotalCallsMetricPerAgent,
                query: voiceCallCountPerFilteringAgentQueryFactory,
                queryV2: (statsFilters: StatsFilters, timezone: string) =>
                    voiceCallsCountPerFilteringAgentQueryFactoryV2(
                        {
                            filters: statsFilters,
                            timezone,
                        },
                        undefined,
                    ),
            },
            {
                name: 'fetchAnsweredCallsMetricPerAgent',
                fetch: fetchAnsweredCallsMetricPerAgent,
                query: (statsFilters: StatsFilters, timezone: string) =>
                    voiceCallCountPerFilteringAgentQueryFactory(
                        statsFilters,
                        timezone,
                        VoiceCallSegment.inboundAnsweredCallsByAgent,
                    ),
                queryV2: (statsFilters: StatsFilters, timezone: string) =>
                    voiceCallsCountPerFilteringAgentQueryFactoryV2(
                        {
                            filters: statsFilters,
                            timezone,
                        },
                        VoiceCallSegment.inboundAnsweredCallsByAgent,
                    ),
            },
            {
                name: 'fetchMissedCallsMetricPerAgent',
                fetch: fetchMissedCallsMetricPerAgent,
                query: (statsFilters: StatsFilters, timezone: string) =>
                    voiceCallCountPerFilteringAgentQueryFactory(
                        statsFilters,
                        timezone,
                        VoiceCallSegment.inboundUnansweredCallsByAgent,
                    ),
                queryV2: (statsFilters: StatsFilters, timezone: string) =>
                    voiceCallsCountPerFilteringAgentQueryFactoryV2(
                        {
                            filters: statsFilters,
                            timezone,
                        },
                        VoiceCallSegment.inboundUnansweredCallsByAgent,
                    ),
            },
            {
                name: 'fetchOutboundCallsMetricPerAgent',
                fetch: fetchOutboundCallsMetricPerAgent,
                query: (statsFilters: StatsFilters, timezone: string) =>
                    voiceCallCountPerFilteringAgentQueryFactory(
                        statsFilters,
                        timezone,
                        VoiceCallSegment.outboundCalls,
                    ),
                queryV2: (statsFilters: StatsFilters, timezone: string) =>
                    voiceCallsCountPerFilteringAgentQueryFactoryV2(
                        {
                            filters: statsFilters,
                            timezone,
                        },
                        VoiceCallSegment.outboundCalls,
                    ),
            },
            {
                name: 'fetchAverageTalkTimeMetricPerAgent',
                fetch: fetchAverageTalkTimeMetricPerAgent,
                query: voiceCallAverageTalkTimePerAgentQueryFactory,
                queryV2: (statsFilters: StatsFilters, timezone: string) =>
                    voiceCallsAverageTalkTimePerAgentQueryFactoryV2({
                        filters: statsFilters,
                        timezone,
                    }),
            },
            {
                name: 'fetchDeclinedCallsMetricPerAgent',
                fetch: fetchDeclinedCallsMetricPerAgent,
                query: declinedVoiceCallsCountPerAgentQueryFactory,
                queryV2: (statsFilters: StatsFilters, timezone: string) =>
                    declinedVoiceCallsCountPerAgentQueryV2Factory({
                        filters: statsFilters,
                        timezone,
                    }),
            },
            {
                name: 'fetchTransferredInboundCallsMetricPerAgent',
                fetch: fetchTransferredInboundCallsMetricPerAgent,
                query: transferredInboundVoiceCallsCountPerAgentQueryFactory,
                queryV2: (statsFilters: StatsFilters, timezone: string) =>
                    transferredInboundVoiceCallsCountPerAgentQueryV2Factory({
                        filters: statsFilters,
                        timezone,
                    }),
            },
        ])('$name should use query', async ({ fetch, query, queryV2 }) => {
            await fetch(statsFilters, userTimezone, agentId)

            expect(fetchMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                query(statsFilters, userTimezone),
                queryV2?.(statsFilters, userTimezone),
                agentId,
            )
        })
    })
})
