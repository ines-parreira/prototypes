import { VoiceCallDirection, VoiceCallStatus } from '@gorgias/helpdesk-queries'

import { agents } from 'fixtures/agents'
import { useMetric } from 'hooks/reporting/useMetric'
import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import {
    voiceCallAverageWaitTimeQueryFactory,
    voiceCallCountQueryFactory,
} from 'models/reporting/queryFactories/voice/voiceCall'
import { StatsFilters } from 'models/stat/types'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import * as constants from 'pages/stats/voice/constants/liveVoice'
import { VoiceMetric } from 'state/ui/stats/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useAverageTalkTimeMetric } from '../../hooks/agentMetrics'
import { useVoiceCallCountMetric } from '../../hooks/useVoiceCallCountMetric'
import { getLiveVoiceMetricCards } from './LiveVoiceMetricsConfig'
import { filterLiveCallsByStatus } from './utils'

jest.mock('pages/stats/voice/components/LiveVoice/utils')
jest.mock('hooks/reporting/useMetric')
jest.mock('models/reporting/queryFactories/voice/voiceCall')
jest.mock('pages/stats/voice/hooks/agentMetrics')
jest.mock('pages/stats/voice/hooks/useVoiceCallCountMetric')

const filterLiveCallsByStatusMock = assumeMock(filterLiveCallsByStatus)
const useMetricMock = assumeMock(useMetric)
const voiceCallAverageWaitTimeQueryFactoryMock = assumeMock(
    voiceCallAverageWaitTimeQueryFactory,
)
const useAverageTalkTimeMetricMock = assumeMock(useAverageTalkTimeMetric)
const useVoiceCallCountMetricMock = assumeMock(useVoiceCallCountMetric)

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
const timezone = 'UTC'

describe('LiveVoiceMetricsConfig', () => {
    beforeEach(() => {
        jest.clearAllMocks()
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
                getLiveVoiceMetricCards(
                    liveVoiceCalls,
                    isLoadingVoiceCalls,
                    filters,
                    timezone,
                ),
            )

            expect(result.current[0]).toMatchObject({
                title: constants.CALLS_IN_QUEUE_METRIC_TITLE,
                hint: constants.CALLS_IN_QUEUE_METRIC_HINT,
                size: 4,
            })
            expect(result.current[0].fetchData()).toEqual({
                data: { value: callsInQueueCount },
                isFetching: isLoadingVoiceCalls,
                isError: false,
            })
        },
    )

    it('should return correct average wait time', () => {
        const { result } = renderHook(() =>
            getLiveVoiceMetricCards([], true, filters, timezone),
        )

        expect(result.current[1]).toMatchObject({
            title: constants.AVERAGE_WAIT_TIME_METRIC_TITLE,
            hint: constants.AVERAGE_WAIT_TIME_METRIC_HINT,
            metricValueFormat: 'duration',
            metricName: VoiceMetric.QueueAverageWaitTime,
            size: 4,
        })
        result.current[1].fetchData()
        expect(useMetricMock).toHaveBeenCalledWith(
            expect(
                voiceCallAverageWaitTimeQueryFactoryMock,
            ).toHaveBeenCalledWith(filters, timezone, true),
        )
    })

    it('should return correct average talk time', () => {
        const { result } = renderHook(() =>
            getLiveVoiceMetricCards([], true, filters, timezone),
        )

        expect(result.current[2]).toMatchObject({
            title: constants.AVERAGE_TALK_TIME_METRIC_TITLE,
            hint: constants.AVERAGE_TALK_TIME_METRIC_HINT,
            metricValueFormat: 'duration',
            metricName: VoiceMetric.QueueAverageTalkTime,
            size: 4,
        })
        result.current[2].fetchData()
        expect(useAverageTalkTimeMetricMock).toHaveBeenCalledWith(
            filters,
            timezone,
            true,
        )
    })

    it.each([
        {
            index: 3,
            title: constants.INBOUND_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_CALLS_METRIC_HINT,
            metricName: VoiceMetric.QueueInboundCalls,
            size: 6,
            filteringSegment: VoiceCallSegment.inboundCalls,
        },
        {
            index: 4,
            title: constants.OUTBOUND_CALLS_METRIC_TITLE,
            hint: constants.OUTBOUND_CALLS_METRIC_HINT,
            metricName: VoiceMetric.QueueOutboundCalls,
            size: 6,
            filteringSegment: VoiceCallSegment.outboundCalls,
        },
        {
            index: 5,
            title: constants.UNANSWERED_INBOUND_CALLS_METRIC_TITLE,
            hint: constants.UNANSWERED_INBOUND_CALLS_METRIC_HINT,
            metricName: VoiceMetric.QueueInboundUnansweredCalls,
            size: 4,
            filteringSegment: VoiceCallSegment.inboundUnansweredCalls,
        },
        {
            index: 6,
            title: constants.INBOUND_MISSED_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_MISSED_CALLS_METRIC_HINT,
            metricName: VoiceMetric.QueueInboundMissedCalls,
            size: 4,
            filteringSegment: VoiceCallSegment.inboundMissedCalls,
            totalCallsQueryFactory: voiceCallCountQueryFactory(
                filters,
                timezone,
                VoiceCallSegment.inboundCalls,
            ),
        },
        {
            index: 7,
            title: constants.INBOUND_ABANDONED_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_ABANDONED_CALLS_METRIC_HINT,
            metricName: VoiceMetric.QueueInboundAbandonedCalls,
            size: 4,
            filteringSegment: VoiceCallSegment.inboundAbandonedCalls,
            totalCallsQueryFactory: voiceCallCountQueryFactory(
                filters,
                timezone,
                VoiceCallSegment.inboundCalls,
            ),
        },
    ])(
        'should return correct voice call count metric',
        ({ index, title, hint, metricName, size, filteringSegment }) => {
            const { result } = renderHook(() =>
                getLiveVoiceMetricCards([], true, filters, timezone),
            )

            expect(result.current[index]).toMatchObject({
                title: title,
                hint: hint,
                metricName: metricName,
                size: size,
            })
            result.current[index].fetchData()
            expect(useVoiceCallCountMetricMock).toHaveBeenCalledWith(
                filters,
                timezone,
                filteringSegment,
                true,
            )
        },
    )

    it.each([
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
    ])(
        'should hide abandoned calls when filtering by agent',
        ({ additionalFilters, shouldHide }) => {
            const { result } = renderHook(() =>
                getLiveVoiceMetricCards(
                    [],
                    true,
                    // @ts-ignore: Filters are not accepted but actually valid
                    { ...filters, ...additionalFilters },
                    timezone,
                ),
            )

            expect(result.current[7]).toMatchObject({
                title: constants.INBOUND_ABANDONED_CALLS_METRIC_TITLE,
                shouldHide: shouldHide,
            })
        },
    )
})
