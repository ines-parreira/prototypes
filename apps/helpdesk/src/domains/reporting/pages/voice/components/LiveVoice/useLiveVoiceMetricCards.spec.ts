import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'

import { VoiceCallDirection, VoiceCallStatus } from '@gorgias/helpdesk-queries'

import { useSummaryMetric } from 'domains/reporting/hooks/useSummaryMetric'
import { VoiceCallSummaryMeasure } from 'domains/reporting/models/cubes/VoiceCallSummaryCube'
import { liveVoiceCallSummaryQueryFactory } from 'domains/reporting/models/queryFactories/voice/voiceCallSummary'
import { voiceCallsSummaryMetricsQueryFactoryV2 } from 'domains/reporting/models/scopes/voiceCallsSummary'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import useLiveVoiceMetricCards from 'domains/reporting/pages/voice/components/LiveVoice/useLiveVoiceMetricCards'
import { filterLiveCallsByStatus } from 'domains/reporting/pages/voice/components/LiveVoice/utils'
import * as constants from 'domains/reporting/pages/voice/constants/liveVoice'
import { VoiceMetric } from 'domains/reporting/state/ui/stats/types'
import { agents } from 'fixtures/agents'

jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)

jest.mock('domains/reporting/pages/voice/components/LiveVoice/utils')
jest.mock('domains/reporting/hooks/useSummaryMetric')
jest.mock('domains/reporting/models/queryFactories/voice/voiceCall')
jest.mock('domains/reporting/models/queryFactories/voice/voiceCallSummary')
jest.mock('domains/reporting/models/scopes/voiceCallsSummary')

const filterLiveCallsByStatusMock = assumeMock(filterLiveCallsByStatus)
const useSummaryMetricMock = assumeMock(useSummaryMetric)
const liveVoiceCallSummaryQueryFactoryMock = assumeMock(
    liveVoiceCallSummaryQueryFactory,
)
const voiceCallsSummaryMetricsQueryFactoryV2Mock = assumeMock(
    voiceCallsSummaryMetricsQueryFactoryV2,
)

const mockSummaryMetric = {
    data: {
        someMeasure: 1,
    },
    isFetching: false,
    isError: false,
}

const sampleLiveVoiceCalls = [
    {
        created_datetime: '',
        direction: VoiceCallDirection.Inbound,
        external_id: '',
        id: 1,
        integration_id: 1,
        provider: '',
        status: VoiceCallStatus.InProgress,
    },
    {
        created_datetime: '',
        direction: VoiceCallDirection.Inbound,
        external_id: '',
        id: 2,
        integration_id: 1,
        provider: '',
        status: VoiceCallStatus.InProgress,
    },
]
const filters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00+01:00',
        end_datetime: '2024-01-01T23:59:59+01:00',
    },
}

describe('useLiveVoiceMetricCards', () => {
    beforeEach(() => {
        filterLiveCallsByStatusMock.mockReturnValue(sampleLiveVoiceCalls)
        useFlagMock.mockReturnValue(false)
        voiceCallsSummaryMetricsQueryFactoryV2Mock.mockReturnValue({
            metricName: 'voice-call-summary',
            scope: 'voice-calls-summary',
            measures: ['inboundVoiceCallsCount'],
            timezone: 'UTC',
            filters: [],
        } as any)
    })

    it.each([
        {
            liveVoiceCalls: sampleLiveVoiceCalls,
            isLoadingVoiceCalls: true,
            callsInQueueCount: 2,
        },
        {
            liveVoiceCalls: [],
            isLoadingVoiceCalls: false,
            callsInQueueCount: 0,
        },
    ])(
        'should return correct calls in queue count',
        ({ liveVoiceCalls, isLoadingVoiceCalls, callsInQueueCount }) => {
            filterLiveCallsByStatusMock.mockReturnValue(liveVoiceCalls)

            const { result } = renderHook(() =>
                useLiveVoiceMetricCards(
                    liveVoiceCalls,
                    isLoadingVoiceCalls,
                    filters,
                ),
            )

            expect(result.current[0]).toMatchObject({
                title: constants.CALLS_IN_QUEUE_METRIC_TITLE,
                hint: constants.CALLS_IN_QUEUE_METRIC_HINT,
                size: 4,
            })
            expect(result.current[0].metric).toEqual({
                data: callsInQueueCount,
                isFetching: isLoadingVoiceCalls,
                isError: false,
            })
        },
    )

    it('should call the correct query for the summary', () => {
        renderHook(() => useLiveVoiceMetricCards([], true, filters))

        expect(useSummaryMetricMock).toHaveBeenCalledWith(
            liveVoiceCallSummaryQueryFactoryMock(filters),
            expect.objectContaining({
                metricName: 'voice-call-summary',
                scope: 'voice-calls-summary',
            }),
            true,
            30 * 1000,
        )
    })

    it.each([
        {
            index: 1,
            title: constants.AVERAGE_WAIT_TIME_METRIC_TITLE,
            hint: constants.AVERAGE_WAIT_TIME_METRIC_HINT,
            metricName: VoiceMetric.QueueAverageWaitTime,
            size: 4,
            measure: VoiceCallSummaryMeasure.VoiceCallSummaryAverageWaitTime,
        },
        {
            index: 2,
            title: constants.AVERAGE_TALK_TIME_METRIC_TITLE,
            hint: constants.AVERAGE_TALK_TIME_METRIC_HINT,
            metricName: VoiceMetric.QueueAverageTalkTime,
            size: 4,
            measure: VoiceCallSummaryMeasure.VoiceCallSummaryAverageTalkTime,
        },
        {
            index: 3,
            title: constants.INBOUND_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_CALLS_METRIC_HINT,
            metricName: VoiceMetric.QueueInboundCalls,
            size: 4,
            measure: VoiceCallSummaryMeasure.VoiceCallSummaryInboundTotal,
        },
        {
            index: 4,
            title: constants.OUTBOUND_CALLS_METRIC_TITLE,
            hint: constants.OUTBOUND_CALLS_METRIC_HINT,
            metricName: VoiceMetric.QueueOutboundCalls,
            size: 4,
            measure: VoiceCallSummaryMeasure.VoiceCallSummaryOutboundTotal,
        },
        {
            index: 5,
            title: constants.UNANSWERED_INBOUND_CALLS_METRIC_TITLE,
            hint: constants.UNANSWERED_INBOUND_CALLS_METRIC_HINT,
            metricName: VoiceMetric.QueueInboundUnansweredCalls,
            size: 4,
            measure: VoiceCallSummaryMeasure.VoiceCallSummaryUnansweredTotal,
        },
        {
            index: 6,
            title: constants.INBOUND_MISSED_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_MISSED_CALLS_METRIC_HINT,
            metricName: VoiceMetric.QueueInboundMissedCalls,
            size: 3,
            measure: VoiceCallSummaryMeasure.VoiceCallSummaryMissedTotal,
        },
        {
            index: 7,
            title: constants.INBOUND_CANCELLED_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_CANCELLED_CALLS_METRIC_HINT,
            metricName: VoiceMetric.QueueInboundCancelledCalls,
            size: 3,
            measure: VoiceCallSummaryMeasure.VoiceCallSummaryCancelledTotal,
        },
        {
            index: 8,
            title: constants.INBOUND_ABANDONED_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_ABANDONED_CALLS_METRIC_HINT,
            metricName: VoiceMetric.QueueInboundAbandonedCalls,
            size: 3,
            measure: VoiceCallSummaryMeasure.VoiceCallSummaryAbandonedTotal,
        },
        {
            index: 9,
            title: constants.INBOUND_CALLBACK_REQUESTED_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_CALLBACK_REQUESTED_CALLS_METRIC_HINT,
            metricName: VoiceMetric.QueueInboundCallbackRequestedCalls,
            size: 3,
            measure:
                VoiceCallSummaryMeasure.VoiceCallSummaryCallbackRequestedTotal,
        },
    ])(
        'should return correct voice call count metric',
        ({ index, title, hint, metricName, size, measure }) => {
            useSummaryMetricMock.mockReturnValue(mockSummaryMetric as any)

            const { result } = renderHook(() =>
                useLiveVoiceMetricCards([], true, filters),
            )

            expect(result.current[index]).toMatchObject({
                title: title,
                hint: hint,
                metric: mockSummaryMetric,
                metricName: metricName,
                measure,
                size: size,
            })
        },
    )

    const statusesHiddenOnAgentFiltering = [
        {
            index: 7,
            title: constants.INBOUND_CANCELLED_CALLS_METRIC_TITLE,
        },
        {
            index: 8,
            title: constants.INBOUND_ABANDONED_CALLS_METRIC_TITLE,
        },
        {
            index: 9,
            title: constants.INBOUND_CALLBACK_REQUESTED_CALLS_METRIC_TITLE,
        },
    ]
    const filteringConfigurations = [
        {
            additionalFilters: {},
            shouldHide: false,
        },
        {
            additionalFilters: {
                agents: {
                    values: [agents[0].id],
                    operator: LogicalOperatorEnum.ONE_OF,
                },
            },
            shouldHide: true,
        },
    ]

    it.each(
        statusesHiddenOnAgentFiltering.flatMap((status) =>
            filteringConfigurations.map((config) => {
                return {
                    index: status.index,
                    title: status.title,
                    additionalFilters: config.additionalFilters,
                    shouldHide: config.shouldHide,
                }
            }),
        ),
    )(
        'should hide $title when filtering by agent',
        ({ index, title, additionalFilters, shouldHide }) => {
            const { result } = renderHook(() =>
                useLiveVoiceMetricCards(
                    [],
                    true,
                    // @ts-ignore: Filters are not accepted but actually valid
                    {
                        ...filters,
                        ...additionalFilters,
                        period: filters.period,
                    },
                ),
            )

            expect(result.current[index]).toMatchObject({
                title: title,
                shouldHide: shouldHide,
            })
        },
    )

    describe('VoiceSLA feature flag', () => {
        it('should include SLA metric when feature flag is enabled', () => {
            useFlagMock.mockImplementation((flag) => {
                return flag === FeatureFlagKey.VoiceSLA
            })

            const { result } = renderHook(() =>
                useLiveVoiceMetricCards([], false, filters),
            )

            const slaMetric = result.current.find(
                (card) =>
                    card.title === constants.SLA_ACHIEVEMENT_RATE_METRIC_TITLE,
            )

            expect(slaMetric).toBeDefined()
            expect(slaMetric).toMatchObject({
                title: constants.SLA_ACHIEVEMENT_RATE_METRIC_TITLE,
                hint: constants.SLA_ACHIEVEMENT_RATE_METRIC_HINT,
                size: 3,
                measure:
                    VoiceCallSummaryMeasure.VoiceCallSummarySlaAchievementRate,
                metricValueFormat: 'percent',
            })
        })

        it('should not include SLA metric when feature flag is disabled', () => {
            useFlagMock.mockReturnValue(false)

            const { result } = renderHook(() =>
                useLiveVoiceMetricCards([], false, filters),
            )

            const slaMetric = result.current.find(
                (card) =>
                    card.title === constants.SLA_ACHIEVEMENT_RATE_METRIC_TITLE,
            )

            expect(slaMetric).toBeUndefined()
        })

        it('should adjust metric sizes when feature flag is enabled', () => {
            useFlagMock.mockImplementation((flag) => {
                return flag === FeatureFlagKey.VoiceSLA
            })

            const { result } = renderHook(() =>
                useLiveVoiceMetricCards([], false, filters),
            )

            expect(result.current[0].size).toBe(3)
            expect(result.current[1].size).toBe(3)
            expect(result.current[2].size).toBe(3)
            expect(result.current[3].size).toBe(3)
        })

        it('should keep original metric sizes when feature flag is disabled', () => {
            useFlagMock.mockReturnValue(false)

            const { result } = renderHook(() =>
                useLiveVoiceMetricCards([], false, filters),
            )

            expect(result.current[0].size).toBe(4)
            expect(result.current[1].size).toBe(4)
            expect(result.current[2].size).toBe(4)
        })
    })
})
