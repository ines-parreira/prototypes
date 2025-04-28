import moment from 'moment/moment'

import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import {
    voiceCallAverageTalkTimePerAgentQueryFactory,
    voiceCallCountPerFilteringAgentQueryFactory,
} from 'models/reporting/queryFactories/voice/voiceCall'
import { declinedVoiceCallsCountPerAgentQueryFactory } from 'models/reporting/queryFactories/voice/voiceEventsByAgent'
import { StatsFilters } from 'models/stat/types'
import { formatReportingQueryDate } from 'utils/reporting'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import {
    fetchAnsweredCallsMetricPerAgent,
    fetchAverageTalkTimeMetricPerAgent,
    fetchDeclinedCallsMetricPerAgent,
    fetchMissedCallsMetricPerAgent,
    fetchOutboundCallsMetricPerAgent,
    fetchTotalCallsMetricPerAgent,
    useAnsweredCallsMetricPerAgent,
    useAverageTalkTimeMetricPerAgent,
    useDeclinedCallsMetricPerAgent,
    useMissedCallsMetricPerAgent,
    useOutboundCallsMetricPerAgent,
    useTotalCallsMetricPerAgent,
} from '../metricsPerDimension'

jest.mock('hooks/reporting/useMetricPerDimension')
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

    describe('hooks', () => {
        it('useTotalCallsMetricPerAgent', () => {
            renderHook(() =>
                useTotalCallsMetricPerAgent(
                    statsFilters,
                    userTimezone,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionMock.mock.calls[0]).toEqual([
                voiceCallCountPerFilteringAgentQueryFactory(
                    statsFilters,
                    userTimezone,
                ),
                agentId,
            ])
        })

        it('useAnsweredCallsMetricPerAgent', () => {
            renderHook(() =>
                useAnsweredCallsMetricPerAgent(
                    statsFilters,
                    userTimezone,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionMock.mock.calls[0]).toEqual([
                voiceCallCountPerFilteringAgentQueryFactory(
                    statsFilters,
                    userTimezone,
                    VoiceCallSegment.inboundAnsweredCallsByAgent,
                ),
                agentId,
            ])
        })

        it('useMissedCallsMetricPerAgent', () => {
            renderHook(() =>
                useMissedCallsMetricPerAgent(
                    statsFilters,
                    userTimezone,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionMock.mock.calls[0]).toEqual([
                voiceCallCountPerFilteringAgentQueryFactory(
                    statsFilters,
                    userTimezone,
                    VoiceCallSegment.inboundUnansweredCallsByAgent,
                ),
                agentId,
            ])
        })

        it('useOutboundCallsMetricPerAgent', () => {
            renderHook(() =>
                useOutboundCallsMetricPerAgent(
                    statsFilters,
                    userTimezone,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionMock.mock.calls[0]).toEqual([
                voiceCallCountPerFilteringAgentQueryFactory(
                    statsFilters,
                    userTimezone,
                    VoiceCallSegment.outboundCalls,
                ),
                agentId,
            ])
        })

        it('useAverageTalkTimeMetricPerAgent', () => {
            renderHook(() =>
                useAverageTalkTimeMetricPerAgent(
                    statsFilters,
                    userTimezone,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionMock.mock.calls[0]).toEqual([
                voiceCallAverageTalkTimePerAgentQueryFactory(
                    statsFilters,
                    userTimezone,
                ),
                agentId,
            ])
        })

        it('useDeclinedCallsMetricPerAgent', () => {
            renderHook(() =>
                useDeclinedCallsMetricPerAgent(
                    statsFilters,
                    userTimezone,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionMock.mock.calls[0]).toEqual([
                declinedVoiceCallsCountPerAgentQueryFactory(
                    statsFilters,
                    userTimezone,
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
                query: (statsFilters, timezone) =>
                    voiceCallCountPerFilteringAgentQueryFactory(
                        statsFilters,
                        timezone,
                        VoiceCallSegment.inboundAnsweredCallsByAgent,
                    ),
            },
            {
                fetch: fetchMissedCallsMetricPerAgent,
                query: (statsFilters, timezone) =>
                    voiceCallCountPerFilteringAgentQueryFactory(
                        statsFilters,
                        timezone,
                        VoiceCallSegment.inboundUnansweredCallsByAgent,
                    ),
            },
            {
                fetch: fetchOutboundCallsMetricPerAgent,
                query: (statsFilters, timezone) =>
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
        ])('should use query', async ({ fetch, query }) => {
            await fetch(statsFilters, userTimezone, agentId)

            expect(fetchMetricPerDimensionMock).toHaveBeenCalledWith(
                query(statsFilters, userTimezone),
                agentId,
            )
        })
    })
})
