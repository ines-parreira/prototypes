import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import { useMetric } from 'domains/reporting/hooks/useMetric'
import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import { voiceCallCountQueryFactory } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { useVoiceCallCountMetric } from 'domains/reporting/pages/voice/hooks/useVoiceCallCountMetric'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetric')
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
