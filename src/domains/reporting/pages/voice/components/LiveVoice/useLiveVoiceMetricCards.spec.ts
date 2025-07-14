import { mockFlags } from 'jest-launchdarkly-mock'

import { VoiceCallDirection, VoiceCallStatus } from '@gorgias/helpdesk-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import { useSummaryMetric } from 'domains/reporting/hooks/useSummaryMetric'
import { VoiceCallSummaryMeasure } from 'domains/reporting/models/cubes/VoiceCallSummaryCube'
import { liveVoiceCallSummaryQueryFactory } from 'domains/reporting/models/queryFactories/voice/voiceCallSummary'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import useLiveVoiceMetricCards from 'domains/reporting/pages/voice/components/LiveVoice/useLiveVoiceMetricCards'
import { filterLiveCallsByStatus } from 'domains/reporting/pages/voice/components/LiveVoice/utils'
import * as constants from 'domains/reporting/pages/voice/constants/liveVoice'
import { VoiceMetric } from 'domains/reporting/state/ui/stats/types'
import { agents } from 'fixtures/agents'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('domains/reporting/pages/voice/components/LiveVoice/utils')
jest.mock('domains/reporting/hooks/useSummaryMetric')
jest.mock('domains/reporting/models/queryFactories/voice/voiceCall')
jest.mock('domains/reporting/models/queryFactories/voice/voiceCallSummary')

const filterLiveCallsByStatusMock = assumeMock(filterLiveCallsByStatus)
const useSummaryMetricMock = assumeMock(useSummaryMetric)
const liveVoiceCallSummaryQueryFactoryMock = assumeMock(
    liveVoiceCallSummaryQueryFactory,
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
        mockFlags({ [FeatureFlagKey.UseLiveVoiceUpdates]: true })
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
                    { ...filters, ...additionalFilters },
                ),
            )

            expect(result.current[index]).toMatchObject({
                title: title,
                shouldHide: shouldHide,
            })
        },
    )
})
