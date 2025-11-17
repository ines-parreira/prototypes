import { assumeMock, renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'
import moment from 'moment'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { VoiceCallMeasure } from 'domains/reporting/models/cubes/VoiceCallCube'
import { usePostReporting } from 'domains/reporting/models/queries'
import { voiceCallCountQueryFactory } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { useVoiceCallCount } from 'domains/reporting/pages/voice/hooks/useVoiceCallCount'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/models/queries')
const usePostReportingMock = assumeMock(usePostReporting)

describe('useVoiceCallCount', () => {
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(moment()),
            start_datetime: formatReportingQueryDate(moment()),
        },
    }

    it('should usePostReporting with query and select', () => {
        usePostReportingMock.mockReturnValueOnce({
            data: [{ [VoiceCallMeasure.VoiceCallCount]: '10' }],
        } as UseQueryResult)

        const results = renderHook(() => useVoiceCallCount(statsFilters, 'UTC'))

        expect(usePostReportingMock.mock.calls[0]).toEqual([
            [
                voiceCallCountQueryFactory(
                    statsFilters,
                    'UTC',
                    undefined,
                    undefined,
                    undefined,
                    METRIC_NAMES.VOICE_CALL_COUNT_TABLE,
                ),
            ],
            { select: expect.any(Function) },
        ])
        expect(results.result.current).toEqual({
            total: 10,
            totalPages: 1,
        })
    })

    it('should usePostReporting with different page size', () => {
        usePostReportingMock.mockReturnValueOnce({
            data: [{ [VoiceCallMeasure.VoiceCallCount]: '10' }],
            isFetching: true,
        } as UseQueryResult)

        const results = renderHook(() =>
            useVoiceCallCount(statsFilters, 'UTC', undefined, 5),
        )

        expect(results.result.current).toEqual({
            total: 10,
            totalPages: 2,
        })
    })

    it('should usePostReporting with error', () => {
        usePostReportingMock.mockReturnValueOnce({
            error: new Error('test'),
        } as UseQueryResult)

        const results = renderHook(() =>
            useVoiceCallCount(statsFilters, 'UTC', undefined, 5),
        )

        expect(results.result.current).toEqual({ total: 0, totalPages: 0 })
    })
})
