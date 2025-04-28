import moment from 'moment'

import { useMetric } from 'hooks/reporting/useMetric'
import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import { voiceCallCountQueryFactory } from 'models/reporting/queryFactories/voice/voiceCall'
import { StatsFilters } from 'models/stat/types'
import { formatReportingQueryDate } from 'utils/reporting'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useVoiceCallCountMetric } from '../useVoiceCallCountMetric'

jest.mock('hooks/reporting/useMetric')
const useMetricMock = assumeMock(useMetric)

describe('useVoiceCallCountMetric', () => {
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(moment()),
            start_datetime: formatReportingQueryDate(moment()),
        },
    }

    it('should useMetric with query and select', () => {
        useMetricMock.mockReturnValueOnce({
            data: 0,
        } as any)

        const results = renderHook(() =>
            useVoiceCallCountMetric(statsFilters, 'UTC'),
        )

        expect(useMetricMock.mock.calls[0]).toEqual([
            voiceCallCountQueryFactory(statsFilters, 'UTC', undefined),
        ])
        expect(results.result.current).toEqual({
            data: 0,
        })
    })

    it('should useMetric and include live data', () => {
        useMetricMock.mockReturnValueOnce({
            data: 0,
        } as any)

        const results = renderHook(() =>
            useVoiceCallCountMetric(
                statsFilters,
                'UTC',
                VoiceCallSegment.inboundCalls,
                true,
            ),
        )

        expect(useMetricMock.mock.calls[0]).toEqual([
            voiceCallCountQueryFactory(
                statsFilters,
                'UTC',
                VoiceCallSegment.inboundCalls,
                undefined,
                true,
            ),
        ])
        expect(results.result.current).toEqual({
            data: 0,
        })
    })
})
