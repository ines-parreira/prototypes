import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment/moment'

import {
    fetchMetricPerDimension,
    useMetricPerDimension,
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
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const fetchMetricPerDimensionMock = assumeMock(fetchMetricPerDimension)

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

            expect(useMetricPerDimensionMock.mock.calls[0]).toEqual([
                voiceCallCountPerFilteringAgentQueryFactory(
                    statsFilters,
                    userTimezone,
                    undefined,
                    sorting,
                ),
                agentId,
            ])
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

            expect(useMetricPerDimensionMock.mock.calls[0]).toEqual([
                voiceCallCountPerFilteringAgentQueryFactory(
                    statsFilters,
                    userTimezone,
                    VoiceCallSegment.inboundAnsweredCallsByAgent,
                    sorting,
                ),
                agentId,
            ])
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

            expect(useMetricPerDimensionMock.mock.calls[0]).toEqual([
                voiceCallCountPerFilteringAgentQueryFactory(
                    statsFilters,
                    userTimezone,
                    VoiceCallSegment.inboundUnansweredCallsByAgent,
                    sorting,
                ),
                agentId,
            ])
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

            expect(useMetricPerDimensionMock.mock.calls[0]).toEqual([
                voiceCallCountPerFilteringAgentQueryFactory(
                    statsFilters,
                    userTimezone,
                    VoiceCallSegment.outboundCalls,
                    sorting,
                ),
                agentId,
            ])
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

            expect(useMetricPerDimensionMock.mock.calls[0]).toEqual([
                voiceCallAverageTalkTimePerAgentQueryFactory(
                    statsFilters,
                    userTimezone,
                    undefined,
                    sorting,
                ),
                agentId,
            ])
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

            expect(useMetricPerDimensionMock.mock.calls[0]).toEqual([
                declinedVoiceCallsCountPerAgentQueryFactory(
                    statsFilters,
                    userTimezone,
                    sorting,
                ),
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

            expect(useMetricPerDimensionMock.mock.calls[0]).toEqual([
                transferredInboundVoiceCallsCountPerAgentQueryFactory(
                    statsFilters,
                    userTimezone,
                    sorting,
                ),
                agentId,
            ])
        })
    })

    describe('fetch', () => {
        it.each([
            {
                fetch: fetchTotalCallsMetricPerAgent,
                query: voiceCallCountPerFilteringAgentQueryFactory,
            },
            {
                fetch: fetchAnsweredCallsMetricPerAgent,
                query: (statsFilters: StatsFilters, timezone: string) =>
                    voiceCallCountPerFilteringAgentQueryFactory(
                        statsFilters,
                        timezone,
                        VoiceCallSegment.inboundAnsweredCallsByAgent,
                    ),
            },
            {
                fetch: fetchMissedCallsMetricPerAgent,
                query: (statsFilters: StatsFilters, timezone: string) =>
                    voiceCallCountPerFilteringAgentQueryFactory(
                        statsFilters,
                        timezone,
                        VoiceCallSegment.inboundUnansweredCallsByAgent,
                    ),
            },
            {
                fetch: fetchOutboundCallsMetricPerAgent,
                query: (statsFilters: StatsFilters, timezone: string) =>
                    voiceCallCountPerFilteringAgentQueryFactory(
                        statsFilters,
                        timezone,
                        VoiceCallSegment.outboundCalls,
                    ),
            },
            {
                fetch: fetchAverageTalkTimeMetricPerAgent,
                query: voiceCallAverageTalkTimePerAgentQueryFactory,
            },
            {
                fetch: fetchDeclinedCallsMetricPerAgent,
                query: declinedVoiceCallsCountPerAgentQueryFactory,
            },
            {
                fetch: fetchTransferredInboundCallsMetricPerAgent,
                query: transferredInboundVoiceCallsCountPerAgentQueryFactory,
            },
        ])('should use query', async ({ fetch, query }) => {
            await fetch(statsFilters, userTimezone, agentId)

            expect(fetchMetricPerDimensionMock).toHaveBeenCalledWith(
                query(statsFilters, userTimezone),
                agentId,
            )
        })
    })
})
