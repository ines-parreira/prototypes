import moment from 'moment/moment'
import {renderHook} from '@testing-library/react-hooks'

import {assumeMock} from 'utils/testing'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate} from 'utils/reporting'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'

import {
    voiceCallAverageTalkTimePerAgentQueryFactory,
    voiceCallCountPerAgentQueryFactory,
    voiceCallCountPerFilteringAgentQueryFactory,
} from 'models/reporting/queryFactories/voice/voiceCall'
import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'

import {
    useAnsweredCallsMetricPerAgent,
    useAverageTalkTimeMetricPerAgent,
    useMissedCallsMetricPerAgent,
    useOutboundCallsMetricPerAgent,
    useTotalCallsMetricPerAgent,
} from '../metricsPerDimension'

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)

describe('metricsPerDimension', () => {
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(moment()),
            start_datetime: formatReportingQueryDate(moment()),
        },
    }

    it('useTotalCallsMetricPerAgent', () => {
        renderHook(() => useTotalCallsMetricPerAgent(statsFilters, 'UTC', '1'))

        expect(useMetricPerDimensionMock.mock.calls[0]).toEqual([
            voiceCallCountPerFilteringAgentQueryFactory(statsFilters, 'UTC'),
            '1',
        ])
    })

    it('useAnsweredCallsMetricPerAgent', () => {
        renderHook(() =>
            useAnsweredCallsMetricPerAgent(statsFilters, 'UTC', '1')
        )

        expect(useMetricPerDimensionMock.mock.calls[0]).toEqual([
            voiceCallCountPerAgentQueryFactory(
                statsFilters,
                'UTC',
                VoiceCallSegment.inboundCalls
            ),
            '1',
        ])
    })

    it('useMissedCallsMetricPerAgent', () => {
        renderHook(() => useMissedCallsMetricPerAgent(statsFilters, 'UTC', '1'))

        expect(useMetricPerDimensionMock.mock.calls[0]).toEqual([
            voiceCallCountPerFilteringAgentQueryFactory(
                statsFilters,
                'UTC',
                VoiceCallSegment.missedCallsByAgent
            ),
            '1',
        ])
    })

    it('useOutboundCallsMetricPerAgent', () => {
        renderHook(() =>
            useOutboundCallsMetricPerAgent(statsFilters, 'UTC', '1')
        )

        expect(useMetricPerDimensionMock.mock.calls[0]).toEqual([
            voiceCallCountPerAgentQueryFactory(
                statsFilters,
                'UTC',
                VoiceCallSegment.outboundCalls
            ),
            '1',
        ])
    })

    it('useAverageTalkTimeMetricPerAgent', () => {
        renderHook(() =>
            useAverageTalkTimeMetricPerAgent(statsFilters, 'UTC', '1')
        )

        expect(useMetricPerDimensionMock.mock.calls[0]).toEqual([
            voiceCallAverageTalkTimePerAgentQueryFactory(statsFilters, 'UTC'),
            '1',
        ])
    })
})
